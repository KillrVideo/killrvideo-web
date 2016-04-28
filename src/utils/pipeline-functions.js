import Promise from 'bluebird';
import R from 'ramda';
import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import { logger } from './logging';
import { isError, isAtom, toRef } from './falcor-conversions';

// Helper function for tapping debug logging into a pipeline
const debugLog = R.tap(x => {
  console.log(x);
});

export const debugLogRequestContext = R.tap(reqCtx => {
  let { pathSet, results, errors } = reqCtx;
  console.log('%j', { pathSet, results, errors });
});

const EMPTY_LIST_VALUE = 'EMPTY';
const NO_TOKEN_VALUE = 'NONE';

// Common props on the ReqCtx object
const pathSetProp = R.prop('pathSet');
const resultsProp = R.prop('results');
const errorsProp = R.prop('errors');

// Set the results on a ReqCtx to a value
const setResults = R.set(R.lensProp('results'));
// a -> ReqCtx r -> ReqCtx r2

// Set the erros on a ReqCtx to a value
const setErrors = R.set(R.lensProp('errors'));
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

export const setErrorsBy = R.curryN(2, R.converge(setErrors, [
  R.call,
  R.nthArg(1)
]));

const isArrayOfStringsOrNumbers = R.pipe(R.head, R.either(R.is(String), R.is(Number)));
// ([ obj ]) => bool

const getIndexesFromRanges = R.chain(R.converge(R.range, [ R.prop('from'), R.compose(R.inc, R.prop('to')) ]));
// ([ { from, to } ]) => [ number ]

export const getPathSetValuesAtDepth = R.pipe(R.nth, R.cond([
  // If a single value, just wrap in an array
  [R.complement(Array.isArray),   R.of],
  // If is an array of strings or numbers, just returns array vals as-is
  [isArrayOfStringsOrNumbers,     R.identity],
  // Otherwise we have an array of ranges so transform them to indexes
  [R.T,                           getIndexesFromRanges]
]));
// (depth, pathSet) => pathSet[depth] => [ pathSetVals ]

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

function getPagingStateCacheKey(path) {
  return path.join('_');
}

const appendToPath = R.curry(function appendToPath(valueFn, pathSetVals, pathAndValue) {
  return pathSetVals.map(psv => {
    let path = R.append(psv, pathAndValue.path);
    let value = valueFn(pathAndValue.value, path);
    return { path, value };
  });
});

const expandPath = R.curry(function expandPath(depth, valueFn, pathSet, pathAndValue) {
  let curDepth = pathAndValue.path.length - 1;
  if (curDepth > depth) {
    throw new Error(`Path is already expanded beyond depth ${depth}`);
  }
  
  let pathAndValues = R.of(pathAndValue);
  while (curDepth < depth) {
    let appendPathSetVals = appendToPath(valueFn, getPathSetValuesAtDepth(curDepth + 1, pathSet));
    pathAndValues = R.chain(appendPathSetVals, pathAndValues);
    curDepth++;
  }
  
  return pathAndValues;
});

const expandPaths = R.curry(function expandPaths(depth, valueFn, pathSet, pathAndValues) {
  return R.chain(expandPath(depth, valueFn, pathSet), pathAndValues);
});

const valueIsError = R.pipe(R.prop('value'), isError);

/**
 * Expand the results to the specified depth by copying any values from parents to their children.
 */
function expandResults(depth) {
  let expand = expandPaths(depth, R.identity);
  return setResultsBy(
    R.converge(expand, [ pathSetProp, resultsProp ])
  );
}

/**
 * Map over the results and set a new value property on each PathAndValue by invoking the mapper function with
 * the current PathAndValue.
 */
function mapResults(mapperFn) {
  mapperFn = R.converge(R.set(R.lensProp('value')), [ mapperFn, R.identity ]);
  let map = R.map(mapperFn);
  return setResultsBy(R.pipe(resultsProp, map));
}

/**
 * Groups results according to the groupFn, then maps over the resulting groups invoking the mapperFn to generate
 * a value for a new PathAndValue where the path is set to the array of all paths in the group. The groupFn is
 * invoked with a PathAndValue. The mapperFn is invoked with all the paths for a group and the groupName.
 */
function groupResults(groupFn, mapperFn) {
  let group = R.groupBy(groupFn);
  let map = R.mapObjIndexed((pathAndValues, groupName) => {
    let paths = R.pluck('path', pathAndValues);
    return {
      path: paths,
      value: mapperFn(paths, groupName)
    };
  });
  return setResultsBy(R.pipe(resultsProp, group, map, R.values));
}

const getPagingCacheKeyForIndexPath = R.pipe(R.dropLast(2), getPagingStateCacheKey);

function getGroupByPageGroupFn() {
  return requestContext => {
    let pagingStateCache = requestContext.router.pagingStateCache;
    return function groupByPage(pathAndValue) {
      let cacheKey = getPagingCacheKeyForIndexPath(pathAndValue.path);
      let index = R.last(pathAndValue.path);
      
      let pagingStates = pagingStateCache.getKey(cacheKey);
      let pagingStateIdx = R.findLastIndex(ps => ps.startingIndex <= index, pagingStates);
      return `${cacheKey}_${pagingStateIdx}`;
    };
  };
}

function getGroupByPageMapFn(mapperFn) {
  return requestContext => {
    let pagingStateCache = requestContext.router.pagingStateCache;
    return function mapByPage(paths, groupName) {
      let [ cacheKey, pagingStateIdx ] = groupName.split('_');
      let pagingState = pagingStateCache.getKey(cacheKey)[pagingStateIdx];
      let lastIndex = R.last(R.map(R.last, paths));
      
      let path = R.dropLast(1, R.head(paths));
      let request = mapperFn(path, groupName);
      request.pagingState = pagingState.pagingState;
      request.pageSize = lastIndex - pagingState.startingIndex + 1;
      return request;
    };
  }
}

function ungroupResults(responseProp, matchFn) {
  let getResponseList = R.prop(responseProp);
  
  let mapResponseListToPaths = R.pipe(R.mapAccum((responses, path) => {
    // Find the response in the list of responses that matches
    let responseIdx = R.findIndex(r => matchFn(path, r), responses);
    
    // Didn't find one? Just return an empty atom as the value
    if (responseIdx === -1) {
      return [ responses, { path, value: $atom() } ];
    }
    
    // Remove the response from the responses array since we matched it and return the appropriate 
    // pathAndValue for the path
    return [
      R.remove(responseIdx, 1, responses),
      { path, value: R.nth(responseIdx, responses) }
    ];
  }), R.nth(1));
  
  let map = R.map(pathAndValue => {
    // The value of pathAndValue will be a single response object with a list/array at the response prop
    let responseList = getResponseList(pathAndValue.value);
    
    // Just propogate errors
    if (isError(responseList)) {
      return pathAndValue.paths.map(path => ({ path, value: responseList }));
    }
    
    // Map all the paths in pathAndvalue.path to responses in the response list
    return mapResponseListToPaths(responseList, pathAndValue.path);
  });
  return setResultsBy(R.pipe(resultsProp, map, R.unnest));
}

function waitForAllRequests() {
  return requestContext => {
    let promises = R.pluck('value', requestContext.results);
    let paths = R.pluck('path', requestContext.results);
    
    return Promise.all(promises).then(responses => {
      let results = R.zipWith((path, value) => ({ path, value }), paths, responses);
      return setResults(results, requestContext);
    });
  };
}

const getPropsWithPropPicker = R.curry(function getPropsWithPropPicker(propPicker, props, obj) {
  let mapperFn = propPicker(R.__, obj);
  return R.map(mapperFn, props);
});

// Return a function that takes a pathAndValue and creates a token from it
function createToken(responseProp, tokenProps, propPicker) {
  let getResponse = R.path([ 'value', responseProp ]);
  return R.ifElse(
    R.pipe(getResponse, R.isEmpty),
    R.always(EMPTY_LIST_VALUE),
    R.pipe(getResponse, R.head, getPropsWithPropPicker(propPicker, tokenProps), R.join('_'))
  );
}

// Return a function that can create a token ref from a pathAndValue
function createTokenRef(tokenFn) {
  let getRefPath = R.converge(R.append, [
    R.pipe(R.prop('path'), R.last, pv => pv += 'List'),
    R.pipe(R.prop('path'), R.dropLast(1))
  ]);
  
  return R.pipe(
    R.converge(R.append, [ tokenFn, getRefPath ]),
    toRef
  );
}

// Return a function that takes a request context and moves error values in the results collection to the errors collection
function moveErrors() {
  // (reqCtx) -> [ [ errors ], [ results ] ]
  let partitionResultsByError = R.pipe(resultsProp, R.partition(valueIsError));
  
  // (reqCtx) -> [ errors ]
  let concatErrors = R.converge(R.concat, [ errorsProp, R.compose(R.nth(0), resultsProp) ]);
  
  // (reqCtx) -> [ results ]
  let pickResults = R.pipe(resultsProp, R.nth(1));
  
  return pipeRequestContext(
    setResultsBy(partitionResultsByError),
    setErrorsBy(concatErrors),
    setResultsBy(pickResults)
  );
}

function createRequests(depth, requestsFn) {
  return pipeRequestContext(
    expandResults(depth),
    requestsFn
  );
}

function mapPathValuesToRequestPromises(serviceName, requestFn) {
    // reqFn = ((req, client) -> Promise)
  requestFn = R.pipe(R.useWith(requestFn, [ R.prop('value'), R.identity ]), handleRequestErrors);
  return R.converge(R.call, [
    R.pipe(addServiceClientToMapperFn(serviceName, requestFn), mapResults), 
    R.identity
  ]);
}

/**
 * Create request objects based on paths at a given depth in the pathSet. The mapperFn provided
 * will be called with each individual path value.
 */
export function createRequestsFromPaths(depth, mapperFn) {
  mapperFn = R.pipe(R.prop('path'), mapperFn);
  return createRequests(depth, mapResults(mapperFn));
};

/**
 * Create request objects by grouping the paths first using the groupByFn, then using the mapperFn
 * to create requests for the group of paths. The mapper fn will be called with an array of path
 * values.
 */
export function createBatchRequestsFromPaths(depth, groupByFn, mapperFn) {
  return createRequests(depth, groupResults(groupByFn, mapperFn));
};

export function createPagedRequestsFromPaths(indexDepth, mapperFn) {
  return createRequests(indexDepth, R.converge(R.call, [
    R.converge(groupResults, [ getGroupByPageGroupFn(), getGroupByPageMapFn(mapperFn) ]),
    R.identity
  ]));
};

export function emptyResults() {
  return setResults([]);
}

/**
 * Take all request objects in the current results and do them by invoking the requestFn. The
 * requestFn will be invoked with the request object from the results and the client for the
 * specified service.
 */
export function doRequests(serviceName, requestFn) {
  return pipeRequestContext(
    mapPathValuesToRequestPromises(serviceName, requestFn),
    waitForAllRequests()
  );
};

/**
 * Maps responses in the results by picking the props at the propDepth specified in the pathSet. Creates 
 * new result objects by picking the props using the propPicker.
 */
export function mapProps(propDepth, propPicker) {
  let valueFn = (value, path) => {
    let prop = path[path.length - 1];
    return propPicker(prop, value);
  };
  let expandResults = expandPaths(propDepth, valueFn);
  let expandErrors = expandPaths(propDepth, R.identity);
  
  return pipeRequestContext(
    moveErrors(),
    setResultsBy(R.converge(expandResults, [ pathSetProp, resultsProp ])),
    setErrorsBy(R.converge(expandErrors, [ pathSetProp, errorsProp ]))
  );
};

/**
 * Clears any paging cache keys found at the specified depth. Returns the original request context (i.e. this
 * performs a side-effect).
 */
export function clearPagingStateCache(depth) {
  return pipeRequestContext(
    expandResults(depth),
    R.tap(
      R.converge(R.forEach, [
        reqCtx => reqCtx.router.pagingStateCache.clearKey.bind(reqCtx.router.pagingStateCache),
        R.pipe(resultsProp, R.map(R.pipe(R.prop('path'), getPagingStateCacheKey, key => key += 'List')))
      ])
    )
  )
};

/**
 * Maps responses in the results to ref values. The list name is calculated using the pathSet
 * values at the depth specified. The token value is created by checking the responseProp specified
 * on the results for a response list with a single value, and then picking the token props specified 
 * from that response using the propPicker.
 */
export function mapResultsToTokenRefs(responseProp, tokenProps, propPicker) {
  let mapperFn = createTokenRef(createToken(responseProp, tokenProps, propPicker));
  return mapResults(mapperFn);
};

/**
 * Map paths at the given depth to list references with no starting token. Useful for lists that
 * don't support stable paging and thus don't have a starting token.
 */
export function mapPathsToNoTokenRefs(depth) {
  let mapperFn = createTokenRef(R.always(NO_TOKEN_VALUE));
  return pipeRequestContext(
    expandResults(depth),
    mapResults(mapperFn)
  );
};

/**
 * Matches individual list items in a batch response object to paths. The matchFn will
 * be invoked with (path, listItem) and should return true if that listItem is for the path. 
 */
export function matchBatchResponsesToPaths(responseProp, matchFn) {
  return ungroupResults(responseProp, matchFn);
};


/**
 * *****************************************************************************************************************************
 * OLD BELOW
 */

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
 * Create request object for a call function. The mapperFn will be called with the args and and callPath and
 * should return a request object.
 */
export function createRequestsFromArgs(mapperFn) {
  return setResultsBy(
    R.converge(R.compose(R.of, mapperFn), [ 
      R.prop('args'),
      R.prop('callPath') 
    ])
  );
};

/**
 * Adds an argument to the requestContext's args collection for a call request.
 */
export function addArg(argFn) {
  return requestContext => {
    requestContext.args = R.append(argFn(requestContext), requestContext.args);
    return requestContext;
  };
};

/**
 * Pipes a request context between step functions. The step functions can return either the requestContext to be
 * used for the next step, or a Promise that resolves to the requestContext for the next step.
 */
export function pipeRequestContext(...steps) {
  return function runPipelineSteps(requestContext) {
    // Start executing steps in order
    let i = 0;
    let isPromise = false;
    while (i < steps.length) {
      // Run current function
      requestContext = steps[i](requestContext);
      i++;
            
      // If we got a Promise back, we need to continue piping once it's resolved
      if (requestContext instanceof Promise) {
        isPromise = true;
        break;
      }
    }
    
    // Did we break for a promise?
    if (isPromise) {
      // Once the promise resolves, execute any steps that are left
      let stepsLeft = i < steps.length ? steps.slice(i) : [];
      let remainingPipeline = pipeRequestContext(...stepsLeft);
      
      return requestContext
        .then(remainingPipeline)
        .catch(err => {
          logger.log('error', 'Error executing pipeline step', err);
          throw err;
        });
    }
    
    return requestContext;
  };
};