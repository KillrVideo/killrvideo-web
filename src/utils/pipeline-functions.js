import Promise from 'bluebird';
import R from 'ramda';
import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import { logger } from './logging';
import { isError, isAtom } from './falcor-conversions';
import { explodePaths } from './falcor-utils';

// Helper function for tapping debug logging into a pipeline
const debugLog = R.tap(x => console.log(x));

const EMPTY_LIST_VALUE = 'EMPTY';
const NO_TOKEN_VALUE = 'NONE';

// Common props on the ReqCtx object
const pathSetProp = R.prop('pathSet');
const resultsProp = R.prop('results');

// Set the results on a ReqCtx to a value
const setResults = R.set(R.lensProp('results'));
// a -> ReqCtx r -> ReqCtx r2

/**
 * Sets the results on a RequestContext by invoking the provided function with the current
 * RequestContext. The function should return the new results.
 */
export const setResultsBy = R.curryN(2, R.converge(setResults, [
  R.call,   // Call the function provided with the reqCtx provided
  R.nthArg(1)
]));
// (ReqCtx r -> resultValue) -> ReqCtx r -> ReqCtx r2

const isArrayOfStringsOrNumbers = R.pipe(R.head, R.either(R.is(String), R.is(Number)));
// ([ obj ]) => bool

const getIndexesFromRanges = R.chain(R.converge(R.range, [ R.prop('from'), R.compose(R.inc, R.prop('to')) ]));
// ([ { from, to } ]) => [ number ]

const getPathSetValuesAtDepth = R.pipe(R.nth, R.cond([
  // If a single value, just wrap in an array
  [R.complement(Array.isArray),   R.of],
  // If is an array of strings or numbers, just returns array vals as-is
  [isArrayOfStringsOrNumbers,     R.identity],
  // Otherwise we have an array of ranges so transform them to indexes
  [R.T,                           getIndexesFromRanges]
]));
// (depth, pathSet) => pathSet[depth] => [ pathSetVals ]

const getPathsAtDepth = R.useWith(R.flip(explodePaths), [
  R.identity,
  pathSetProp
]);
// int depth -> ReqCtx r -> [ paths ]

function mapPathsAtDepth(depth, mapperFn) {
  let map = R.map(mapperFn);
  let getPaths = getPathsAtDepth(depth);
  return requestContext => {
    return map(getPaths(requestContext));
  };
}
// (int depth, (Path p -> a)) -> (ReqCtx r -> [ a ])

const mapResults = R.useWith(R.map, [
  R.identity,
  resultsProp
]);
// (a -> b) -> ReqCtx r -> [ b ]

const getServiceClient = R.curry(function getServiceClient(serviceName, reqCtx) {
  return reqCtx.router.getServiceClient(serviceName);
});
// Str serviceName -> ReqCtx r -> GrpcClient c

function addServiceClientToMapperFn(serviceName, mapperFn) {
  let getService = getServiceClient(serviceName);
  return requestContext => {
    let client = getService(requestContext);
    return R.partialRight(R.binary(mapperFn), R.of(client));
  };
}
// (Str serviceName, (Path p -> a)) -> ReqCtx r -> ((Path p, GrpcClient c) -> a)

function handleRequestErrors(requestPromise) {
  return requestPromise.catch(err => {
    logger.log('error', 'Error calling service', err);
    return $error();
  });
}

function toJsonGraph(paths, results) {
  return paths.reduce((acc, path, idx) => {
    return R.set(R.lensPath(path), results[idx], acc);
  }, {});
}

function getPagingStateCache(reqCtx) {
  return reqCtx.router.pagingStateCache;
}

function getPagingStateCacheKey(path) {
  return path.join('_');
}

function createToken(responseProp, tokenProps, propPicker) {
  let getResponse = R.prop(responseProp);
  let getToken = R.pipe(propPicker(tokenProps), R.props(tokenProps), R.join('_'));
  
  return R.unless(isError, response => {
    // Is response prop an empty list?
    let r = getResponse(response);
    if (R.isEmpty(r)) {
      return EMPTY_LIST_VALUE;
    }
    
    return getToken(r[0]);
  });
}

/**
 * Returns a list of pages from the given paths with indexes. A page looks like:
 *  {
 *    request: Obj,
      startingIndex: Int,
      pagingState: Str,
      paths: [],
      savePagingStateToKey: Str
 *  }
 */
function groupPathsIntoPages(paths, pagingStateCache, mapperFn) {
  // A path should be [ ...pagingStatePath, startingToken, index ]
  let fullLength = paths[0].length;
    
  // Group paths by the paging state cache key for the path
  let pathsByPagingStateKey = R.groupBy(path => {
    // The path to generate the paging state key should be everything before the starting token and index
    let pagingStatePath = R.take(fullLength - 2, path);
    return getPagingStateCacheKey(pagingStatePath);
  }, paths);
  
  let startingTokenIdx = fullLength - 2;
  let indexIdx = fullLength - 1;
  
  // Map each paging state key's paths to pages
  let pages = R.mapObjIndexed((paths, pagingStateKey) => {
    // Make sure there is only one starting token for each list
    let startingTokens = R.uniqBy(R.nth(startingTokenIdx), paths);
    if (startingTokens.length !== 1) {
      throw new Error('Each list should only ever have one unique starting token');
    }
    
    // Get the starting token and if an empty list value, bail early
    let startingToken = startingTokens[0];
    if (startingToken === EMPTY_LIST_VALUE) {
      return [
        { request: EMPTY_LIST_VALUE, paths }
      ];
    }
        
    let pagingStates = pagingStateCache.getKey(pagingStateKey);
    let pagingStateIdx = 0;
    
    let pages = [];
    let newPage = true;
    
    // Loop through the paths and group them into page objects
    for (let i = 0; i < paths.length; i++) {
      // Get path and the index that should be the last element of the path
      let path = paths[i];
      let index = path[indexIdx];
      
      // Find the appropriate paging state for that index
      while (pagingStateIdx < pagingStates.length - 1 && index >= pagingStates[pagingStateIdx + 1].startingIndex) {
        pagingStateIdx++;
        newPage = true;
      }
      
      // Create the page object if necessary
      if (newPage) {
        // Create a request object and add some paging info to it
        let request = mapperFn(R.take(fullLength - 1, path));
        
        let { startingIndex, pagingState } = pagingStates[pagingStateIdx];
        let page = {
          request,
          startingIndex,
          pagingState,
          paths: []
        };
        
        // We want to save the paging state from the response if this is the last paging state
        // we know about
        if (pagingStateIdx === pagingStates.length - 1) {
          page.savePagingStateToKey = pagingStateKey;
        }
        
        pages.push(page);
      }
      
      // Add the path to the current page
      pages[pages.length - 1].paths.push(path);
      newPage = false;
    }
    
    return pages;
  }, pathsByPagingStateKey);
  
  return R.unnest(R.values(pages));
}

function createListReference(path, token) {
  if (isError(token)) {
    return token;
  }
  
  let listName = `${path[path.length - 1]}List`;
  let listPath = R.append(token, R.append(listName, R.dropLast(1, path)));
  return $ref(listPath);
}

/**
 * Create request objects based on paths at a given depth in the pathSet. The mapperFn provided
 * will be called with the path values.
 */
export function createRequestsFromPaths(depth, mapperFn) {
  return setResultsBy(mapPathsAtDepth(depth, mapperFn));
};

/**
 * Take all request objects in the current results and do them by invoking the requestFn. The
 * requestFn will be invoked with the request object from the results and the client for the
 * specified service.
 */
export function doRequests(serviceName, requestFn) {
  let getMapperFn = addServiceClientToMapperFn(serviceName, requestFn);
  
  return requestContext => {
    // Mapper fn will be invoked with (req, client)
    let mapperFn = R.pipe(getMapperFn(requestContext), handleRequestErrors);
    
    // Run mapper function with request objects from the results property
    let promises = mapResults(mapperFn, requestContext);
    
    // Set results to response values once all promises have completed
    return Promise.all(promises).then(responses => {
      return setResults(responses, requestContext);
    });
  };
};

/**
 * Maps responses found in the results by picking the props at the propDepth specified in the pathSet. Creates 
 * new result objects by picking the props using the propPicker.
 */
export function mapResponses(propDepth, propPicker) {
  return requestContext => {
    let props = getPathSetValuesAtDepth(propDepth, requestContext.pathSet);
    let mapperFn = R.unless(isAtom, propPicker(props));
    return setResultsBy(mapResults(mapperFn), requestContext);
  };
};

/**
 * Zips all the paths at the depth specified with the results and returns a new JSON graph result.
 */
export function zipPathsAndResultsToJsonGraph(depth) {
  let getPaths = getPathsAtDepth(depth);
  return requestContext => {
    let paths = getPaths(requestContext);
    let results = requestContext.results;
    return setResults({ jsonGraph: toJsonGraph(paths, results) }, requestContext);
  };
};

/**
 * Clears any paging cache keys found at the specified depth. Returns the original request context (i.e. this
 * performs a side-effect).
 */
export function clearPagingStateCache(depth) {
  let getPaths = getPathsAtDepth(depth);
  return requestContext => {
    let cache = getPagingStateCache(requestContext);
    let paths = getPaths(requestContext);
    paths.forEach(path => {
      // Append list to the key generated from the path since the path for the refs generated to lists will add the 'List' suffix 
      let key = `${getPagingStateCacheKey(path)}List`;
      cache.clearKey(key);
    });
    return requestContext;
  };
};

/**
 * Maps responses in the results to ref values. The list name is calculated using the pathSet
 * values at the depth specified. The token value is created by checking the responseProp specified
 * on the results for a response list with a single value, and then picking the token props specified 
 * from that response using the propPicker.
 */
export function mapResponsesToTokenRefs(depth, responseProp, tokenProps, propPicker) {
  let getPaths = getPathsAtDepth(depth);
  let mapperFn = createToken(responseProp, tokenProps, propPicker);
  return requestContext => {
    let paths = getPaths(requestContext);
    let tokens = mapResults(mapperFn, requestContext);
    let tokenRefs = R.zipWith(createListReference, paths, tokens);
    return setResults(tokenRefs, requestContext);
  };
};

/**
 * Map paths at the given depth to list references with no starting token. Useful for lists that
 * don't support stable paging and thus don't have a starting token.
 */
export function mapPathsToNoTokenRefs(depth) {
  return setResultsBy(mapPathsAtDepth(depth, path => createListReference(path, NO_TOKEN_VALUE)));
}

/**
 * Like createRequestsFromPaths, creates request objects. The mapper function is invoked with all
 * paths at indexDepth - 1 and should create request objects which paging information can then
 * be added to. The requests are then placed in the results.
 */
export function createPagedRequestsFromPaths(indexDepth, mapperFn) {
  let getPaths = getPathsAtDepth(indexDepth);
    
  return requestContext => {
    let paths = getPaths(requestContext);
    let pagingStateCache = getPagingStateCache(requestContext);
    
    let pages = groupPathsIntoPages(paths, pagingStateCache, mapperFn);
    return setResults(pages, requestContext);
  };
};

/**
 * Like doRequests, executes service requests that are paged and were created using the createPagedRequestsFromPaths
 * function. The requestFn will be invoked with a request object and a service client instance. The results will
 * be the responses from those requests with a response object available for each path at the indexDepth used
 * when calling createPagedRequestsFromPaths.
 */
export function doPagedRequests(serviceName, requestFn, responseProp) {
  let getMapperFn = addServiceClientToMapperFn(serviceName, requestFn);
  let getResponseList = R.prop(responseProp);
  
  return requestContext => {
    // Mapper fn will be invoked with (req, client)
    let mapperFn = getMapperFn(requestContext);
    
    let pagingStateCache = getPagingStateCache(requestContext);
    
    // Get the pages that should currently be in the results and map to actual requests
    let pages = requestContext.results;
    let promises = pages.map(page => {
      // No need to do requests for empty lists
      if (page.request === EMPTY_LIST_VALUE) {
        return Promise.resolve({});
      }
      
      // Calculate the page size
      let lastPath = page.paths[page.paths.length - 1];
      let lastIndex = lastPath[lastPath.length - 1];
      let pageSize = lastIndex - page.startingIndex + 1;
      
      // Take the request and add the paging info to it
      let req = R.clone(page.request);
      req.pageSize = pageSize;
      req.pagingState = page.pagingState;
      
      // Call the request function and save paging state if necessary
      let promise = mapperFn(req);
      if (page.savePagingStateToKey) {
        promise = promise.tap(response => {
          let nextStartingIndex = page.startingIndex + req.pageSize;
          pagingStateCache.saveKey(page.savePagingStateToKey, nextStartingIndex, response.pagingState);
        });
      }
      
      // Handle errors and return promise     
      return handleRequestErrors(promise);
    });
    
    return Promise.all(promises).then(responses => {
      let results = R.zipWith((page, res) => {
        // Just return empty atoms for all paths when an empty list
        if (page.request === EMPTY_LIST_VALUE) {
          return page.paths.map(p => $atom());
        }
        
        let responseList = getResponseList(res);
        return page.paths.map(path => {
          // Adjust the index in the path based on the starting index for the page
          let index = path[path.length - 1];
          let adjustedIndex = index - page.startingIndex;
          
          // Pick the item out of the response list or return an empty atom
          return responseList.length > adjustedIndex
            ? responseList[adjustedIndex]
            : $atom();
        });
      }, pages, responses);
      return setResults(R.unnest(results), requestContext);
    });
  };
};

/**
 * Create a single request object from all paths at a given depth. The mapperFn will be invoked with all the
 * paths at the given depth and should return a request object.
 */
export function createRequestFromAllPaths(depth, mapperFn) {
  let getPaths = getPathsAtDepth(depth);
  return requestContext => {
    let paths = getPaths(requestContext);
    let request = mapperFn(paths);
    return setResults([ request ], requestContext);
  };
};

/**
 * Matches individual items in a list on a response object to paths at the specified depth. The matchFn will
 * be invoked with (path, listItem) and should return true if that listItem is for the path. The results will
 * be set to each an array of listItems in the same order as the paths they matched.
 */
export function matchResponseListToPaths(depth, responseProp, matchFn) {
  let getPaths = getPathsAtDepth(depth);
  let getResponseList = R.prop(responseProp);
  
  return requestContext => {
    let paths = getPaths(requestContext);
    
    // Sanity check, we should only have a single response in the results array
    if (requestContext.results.length !== 1) {
      throw new Error('Expected a single response');
    }
    
    // See if the response was an error and if so, set the results to an array of errors for each path
    let response = requestContext.results[0];
    if (isError(response)) {
      return setResults(R.repeat(response, paths.length), requestContext);
    }
    
    let allResponses = getResponseList(response);
    
    // For each path ...
    let responsesByPath = R.mapAccum((responses, path) => {
      // Run the matchFn trying to find a matching response in the responses
      let responseIdx = R.findIndex(r => matchFn(path, r), responses);
      
      // If we don't find one, just use an empty atom as the value for that path
      if (responseIdx === -1) {
        return [ responses, $atom() ];
      }
      
      // Remove the response from the responses list (so it doesn't get matched again) and return the
      // response that matched for this path
      return [ R.remove(responseIdx, 1, responses), R.nth(responseIdx, responses) ]
    }, allResponses, paths);
    
    // The second element in responsesByPath will be the new array of responses found for each path
    return setResults(responsesByPath[1], requestContext);
  };
};

/**
 * Create request object from the args to a call. The mapperFn will be called with the args and
 * should return a response object.
 */
export function createRequestsFromArgs(mapperFn) {
  return setResultsBy(R.pipe(R.prop('args'), mapperFn, R.of));
};

/**
 * Adds an argument to the requestContext's args collection for a call request.
 */
export function addArg(arg) {
  return requestContext => {
    requestContext.args = R.append(arg, requestContext.args);
    return requestContext;
  };
};
