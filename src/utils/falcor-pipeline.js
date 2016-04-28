import Promise from 'bluebird';
import { logger } from './logging';
import { pipeRequestContext, getPathSetValuesAtDepth } from './pipeline-functions';

function returnResults(requestContext) {
  return requestContext.results.concat(requestContext.errors);
}

/**
 * Creates a request pipeline function for a Falcor get request. The steps passed as arguments
 * should be functions that take a RequestContext object and return either the RequestContext or
 * a Promise of a RequestContext. Steps will be executed in order and the results from
 * the RequestContext will be returned when finished.
 */
export function createGetPipeline(...steps) {
  let pipeline = pipeRequestContext(...steps, returnResults);
  
  return function createRequestContextAndRunPipeline(pathSet) {
    let requestContext = {
      pathSet,
      router: this,
      results: getPathSetValuesAtDepth(0, pathSet).map(p => ({ path: [ p ], value: null })),
      errors: []
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
  let pipeline = pipeRequestContext(...steps, returnResults);
  
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