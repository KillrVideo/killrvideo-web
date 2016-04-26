import Promise from 'bluebird';
import { logger } from './logging';

/**
 * Creates a request pipeline function for a Falcor get request. The steps passed as arguments
 * should be functions that take a RequestContext object and return either the RequestContext or
 * a Promise of a RequestContext. Steps will be executed in order and the results from
 * the RequestContext will be returned when finished.
 */
export function createGetPipeline(...steps) {
  let pipeline = pipeRequestContext(...steps);
  
  return function createRequestContextAndRunPipeline(pathSet) {
    let requestContext = { 
      pathSet,
      router: this,
      results: null
    };
    return pipeline(requestContext);
  };
};

/**
 * Creates a request pipeline function for a Falcor call request. The steps passed as arguments
 * should be functions that take a RequestContext object and return either the RequestContext for
 * the next step or a Promise of a RequestContext. Steps are executed in order and the results on
 * the RequestContext will be returned when finished.
 */
export function createCallPipeline(...steps) {
  let pipeline = pipeRequestContext(...steps);
  
  return function createRequestContextAndRunPipeline(callPath, args) {
    let requestContext = {
      callPath,
      args,
      router: this,
      results: null
    };
    return pipeline(requestContext);
  };
}

/**
 * Pipes a request context between step functions. The step functions can return either the requestContext to be
 * used for the next step, or a Promise that resolves to the requestContext for the next step.
 */
function pipeRequestContext(...steps) {
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
    
    return requestContext.results;
  };
};