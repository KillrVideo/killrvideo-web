import Promise from 'bluebird';
import { logger } from './logging';

/**
 * Creates a request pipeline function for a Falcor get request. The steps passed as arguments
 * should be functions that take a RequestContext object and return either the RequestContext or
 * a Promise of a RequestContext. Steps will be executed in order and the path values from
 * the RequestContext will be returned when finished.
 */
export function createGetPipeline(...steps) {
  return function(pathSet) {
    let requestContext = createRequestContext(pathSet, this);
    return executeSteps(steps, requestContext);
  }
};

/**
 * Execute steps for the given request context, accounting for steps that return Promises.
 */
function executeSteps(steps, requestContext) {
  let i = 0;
  let isPromise = false;
  while (i < steps.length) {
    // Run the current step
    requestContext = steps[i](requestContext);
    
    // Go to next step
    i++;
    
    // If a Promise was returned, we need to continue once it resolves
    if (requestContext instanceof Promise) {
      isPromise = true;
      break;
    }
  }
  
  // Did we break for a Promise?
  if (isPromise) {
    // Once the promise resolves, execute any steps that are left
    let stepsLeft = i < steps.length ? steps.slice(i) : [];
    return requestContext
      .catch(err => {
        logger.log('error', 'Error executing pipeline step', err);
        throw err;
      })
      .then(reqCtx => {
        return executeSteps(stepsLeft, reqCtx);
      });
  }
  
  // Return the path values for the request
  return {
    jsonGraph: requestContext.result
  };
}

function createRequestContext(pathSet, router) {
  return {
    pathSet,
    router,
    depth: 0,
    result: {}
  };
}