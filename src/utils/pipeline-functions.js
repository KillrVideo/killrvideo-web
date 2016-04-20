import Promise from 'bluebird';
import R from 'ramda';
import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import { logger } from './logging';
import { isError } from './falcor-conversions';

// Helper function for tapping debug logging into a pipeline
const debugLog = R.tap(x => console.log(x));

/**
 * Advance the request context to the specified depth.
 */
export function advanceToDepth(depth) {
  return requestContext => {
    requestContext.advanceToDepth(depth);
    return requestContext;
  };
};

/**
 * Create requests at the leaf nodes of the current depth using the specified mapper function. The mapper function
 * will be passed the path value of the leaf for each leaf and should return an object that can be used as a Grpc
 * service request.
 */
export function createRequests(mapperFn) {
  return requestContext => {
    let depth = requestContext.getDepth();
    requestContext.getPathValues().forEach(pv => {
      let leaf = pv.path[depth];
      pv.value = mapperFn(leaf);
    });
    return requestContext;
  };
};

/**
 * Do any requests found at the leaf nodes of the current depth using the specified service name. The requestFn provided
 * will be called with (serviceClient, req) parameters for each leaf node where a value is found and should return the
 * Promise from executing that request with the client. The leaf node values will be replaced with the response object from the
 * request when successful or falcor error values if there is a problem.
 */
export function doRequests(serviceName, requestFn) {
  return requestContext => {
    let client = requestContext.getRouter().getServiceClient(serviceName);
    let pathValues = requestContext.getPathValues();
    let requests = [];
    for (let i = 0; i < pathValues.length; i++) {
      let pv = pathValues[i];
      if (!pv.value) {
        continue;
      }
      
      let promise = requestFn(client, pv.value)
        .then(response => {
          // Replace the value with the response if successful
          pv.value = response;
        })
        .catch(err => {
          // Otherwise log error and replace path value with an error object
          logger('error', `Error while calling ${serviceName}`, err);
          pv.value = $error();
        });
      
      requests.push(promise);
    }
    
    if (requests.length > 0) {
      return Promise.all(requests).return(requestContext);
    }
    
    return requestContext;
  };
}

/**
 * Picks properties from response objects at the leaf nodes. The current path value of the leaf is assumed to be
 * the property name and the specified propPicker function is used to pick the property values from the objects. 
 */
export function pickPropsFromResponses(propPicker) {
  return requestContext => {
    let pathValues = requestContext.getPathValues();
    let depth = requestContext.getDepth();
    for (let i = 0; i < pathValues.length; i++) {
      let pv = pathValues[i];
      if (isError(pv.value)) {
        continue;
      }
      
      let propName = pv.path[depth];
      
      // Replace the response object with the picked property value
      pv.value = propPicker(propName, pv.value);
    }
    return requestContext;
  };
}

/**
 * Clears the paging state cache for any keys created for paths to the current depth. The cache keys are derived
 * from any paths at the current depth.
 */
export function clearPagingStateCache() {
  return requestContext => {
    let pathValues = requestContext.getPathValues();
    let pagingStateCache = requestContext.getRouter().pagingStateCache;
    
    // Clear keys derived by concating path elements together
    pathValues.forEach(pv => {
      let cacheKey = pv.path.join('_');
      pagingStateCache.clearKey(cacheKey);
    });
    
    return requestContext;
  };
};

const EMPTY_LIST_VALUE = R.always('NONE');
const getPathValues = R.invoker(0, 'getPathValues');

export function createPagingToken(listPath, tokenProps, propPicker) {
  // responseObj => pathValue => bool
  const responseListIsEmpty = R.pipe(R.path(listPath), R.isEmpty);
  
  // responseObj => [ propVals ]
  const pickProps = R.juxt(R.map(propPicker, tokenProps));
  
  // responseObj => responseList => responseList[0] => [ props ] => strToken
  const getToken = R.pipe(R.path(listPath), R.head, pickProps, R.join('_'));
  
  // Take a RequestContext and return it when finished
  return R.tap( 
    // With that request context
    R.pipe(
      // Get the path values
      getPathValues,
      // Iterate over the path values
      R.forEach(
        R.over(R.lensProp('value'), 
          R.ifElse(
            responseListIsEmpty,
            EMPTY_LIST_VALUE,
            getToken
          )
        )
      )
    )
  );
};
