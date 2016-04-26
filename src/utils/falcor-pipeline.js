import Promise from 'bluebird';
import { logger } from './logging';
import { pipeRequestContext } from './pipeline-functions';

function returnResults(requestContext) {
  return requestContext.results;
}

/**
 * Creates a request pipeline function for a Falcor get request. The steps passed as arguments
 * should be functions that take a RequestContext object and return either the RequestContext or
 * a Promise of a RequestContext. Steps will be executed in order and the path values from
 * the RequestContext will be returned when finished.
 */
export function createGetPipeline(...steps) {
  let pipeline = pipeRequestContext(...steps, returnResults);
  
  return function createRequestContextAndRunPipeline(pathSet) {
    let requestContext = { 
      pathSet,
      router: this,
      results: null
    };
    return pipeline(requestContext);
  };
};

export function createCallPipeline(...steps) {
  let pipeline = pipeRequestContext(...steps, returnResults);
  
  return function createRequestContextAndRunPipeline(callPath, args) {
    let requestContext = {
      pathSet: callPath,
      args,
      router: this,
      results: null
    };
    return pipeline(requestContext);
  };
}