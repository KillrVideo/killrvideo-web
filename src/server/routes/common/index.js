import R from 'ramda';
import Promise from 'bluebird';

import { getServiceClientAsync } from '../../services/factory';
import { expandPathSet } from './pathsets';
import { generatePaths, expandPaths } from './paths';
import { handleRequestErrors, catchErrors } from './promises';
import { pickPropsFromResponse } from './props'
import { createTokenRef, createDummyTokenRef, isEmptyToken, clearPagingStateCache } from './list-tokens';
import { getPages, createRequests, pickResponseValuesForPage } from './paged';
import { pickResponseValuesForBatch } from './batched';
import { toAtom } from './sentinels';

import './typedefs';

/**
 * Creates a route handler for common scenario of getting a single object from a service request and then
 * picking property values from that object and returning them. Assumes that the last part of the requested
 * paths will be the array of properties to pick.
 * 
 * @param {CreateRequestFunction} createRequestFn - Function called which each requested path that should
 *  create a request object that can be used with the service.
 * @param {string} serviceName - The service name constant of the service to call with the request object(s).
 * @param {RequestFunction} requestFn - Function that should call the appropriate method on the service
 *  client and return a Promise with the response from the service.
 * @param {PropPicker} propPicker - A function that can pick properties from the response object, possibly
 *  transforming the original values.
 * @returns {GetRouteHandler} A route handler for Falcor get requests.
 */
export function serviceRequest(createRequestFn, serviceName, requestFn, propPicker) {
  let handleErrors = handleRequestErrors(serviceName);
  
  return function doServiceRequestPerPath(pathSet) {
    pathSet = expandPathSet(pathSet);
    
    const propsIdx = pathSet.length - 1;
    const reqIdx = propsIdx - 1;
    
    // Generate initial paths based on each path at the request index
    let paths = generatePaths(reqIdx, pathSet);
    
    // Do requests with the client
    let clientPromise = getServiceClientAsync(serviceName);
    let promises = paths.map(path => {
      let req = createRequestFn(path);
      return clientPromise.then(client => requestFn(req, client)).catch(handleErrors);
    });
    
    // Wait for all requests to finish and then pick props
    const props = pathSet[propsIdx];
    let pickProps = R.zipWith(R.partial(pickPropsFromResponse, [ propPicker, props ]), paths);
    return Promise.all(promises).then(R.pipe(pickProps, R.unnest));
  };
};

/**
 * Creates a route handler for the common scenario of getting a stable reference to a list of objects
 * (stable for paging). The route handler will return a reference with a starting point in the list.
 * 
 * @param {CreateRequestFunction} createRequestFn - Function called with each requested path that should
 *  create a request object that can be used with the service.
 * @param {string} serviceName - The service name constant of the service to call with the request object.
 * @param {RequestFunction} requestFn - Function that should call the appropriate method on the service
 *  client and return a Promise with the response from the service.
 * @param {Array<string>} tokenProps - The props to pick from the response in order to create a "token"
 *  that points at the start of the list.
 * @param {PropPicker} propPicker - The function to pick the token property values with.
 * @returns {GetRouteHandler} A route handler for Falcor get requests.
 */
export function listReference(createRequestFn, serviceName, requestFn, tokenProps, propPicker) {
  let handleErrors = handleRequestErrors(serviceName);
  
  return function doListReference(pathSet) {
    pathSet = expandPathSet(pathSet);
    
    const listIdx = pathSet.length - 1;
    
    // Generate initial paths and requests based on each path at the request index and clear paging state for the list(s)
    let paths = generatePaths(listIdx, pathSet);
    clearPagingStateCache(this.pagingStateCache, paths);
    
    // Do requests with the client
    let clientPromise = getServiceClientAsync(serviceName);
    let promises = paths.map(path => {
      let req = createRequestFn(path);
      return clientPromise.then(client => requestFn(req, client)).catch(handleErrors);
    });
        
    // Wait for all requests to finish, then create token refs to the list(s)
    let createTokenRefs = R.zipWith(R.partial(createTokenRef, [ propPicker, tokenProps ]), paths);
    return Promise.all(promises).then(createTokenRefs);
  };
};

/**
 * Creates a route handler for the common scenario of getting a stable reference to a list of objects
 * where the service doesn't support a stable starting point for paging in the list. The route handler
 * will return a reference to a list with a "dummy" value for the starting token.
 * 
 * @returns {GetRouteHandler} A route handler for Falcor get requests.
 */
export function listReferenceWithDummyToken() {
  return function doListReferenceWithDummyToken(pathSet) {
    pathSet = expandPathSet(pathSet);
    
    const listIdx = pathSet.length - 1;
    
    let paths = generatePaths(listIdx, pathSet);
    clearPagingStateCache(this.pagingStateCache, paths);
    return R.map(createDummyTokenRef, paths);
  };
};

/**
 * Creates a route handler for the common scenario of getting a page from a list of objects in a service,
 * then picking specific properties from those objects and returning them. Assumes that the last three parts of
 * the requested paths will be: 1) a starting token for the first item in the list, 2) the indexes of the
 * requested items in the list, and finally 3) the properties to pick from each object in the list.
 * 
 * @param {CreateRequestFunction} createRequestFn - Function called to generate a request object for each path
 *  that is unique for a page that will be requested. Page-specific data like pageSize and pagingState props
 *  do not need to be included in the returned object.
 * @param {string} serviceName - The service name constant of the service to call with the requests.
 * @param {RequestFunction} requestFn - Function that should call the appropriate method on the service client
 *  and return a Promise with the response from the service.
 * @param {PropPicker} propPicker - The function to pick property values from each response object in the list
 *  that is returned from the service.
 * @returns {GetRouteHandler} A route handler for Falcor get requests.
 */
export function pagedServiceRequest(createRequestFn, serviceName, requestFn, propPicker) {
  let handleErrors = handleRequestErrors(serviceName);
  
  return function doPagedServiceRequest(pathSet) {
    pathSet = expandPathSet(pathSet);
    
    const propsIdx = pathSet.length - 1;
    const indexesIdx = propsIdx - 1;
    const tokenIdx = indexesIdx - 1;
    
    // Generate initial paths and partition into groups based on whether the paths are for an empty list token
    let allPaths = generatePaths(indexesIdx, pathSet);
    let [ emptyPaths, paths ] = R.partition(isEmptyToken(tokenIdx), allPaths);
    
    // Map empty list paths to atom props
    emptyPaths = expandPaths(propsIdx, pathSet, emptyPaths);
    let emptyPathValues = R.map(path => ({ path, value: toAtom() }), emptyPaths);
    
    // Group paths that aren't for an empty list into pages and then create request objects for those pages
    let pages = getPages(this.pagingStateCache, paths);
    let requests = createRequests(createRequestFn, pages);
    
    // Do requests with the client
    let clientPromise = getServiceClientAsync(serviceName);
    let promises = requests.map(req => {
      return clientPromise.then(client => requestFn(req, client)).catch(handleErrors);
    });
    
    // Wait for all requests to finish, then pick props from responses
    let pickResponses = R.zipWith(pickResponseValuesForPage, pages);
    const props = pathSet[propsIdx];
    let pickProps = R.zipWith(R.partial(pickPropsFromResponse, [ propPicker, props ]), paths);
    return Promise.all(promises).then(R.pipe(pickResponses, R.unnest, pickProps, R.unnest, R.concat(emptyPathValues)));
  };
};

/**
 * Creates a route handler for the common scenario of getting multiple objects from a service that supports
 * retrieving multiple objects by their unique identifiers in a single service request, then picking properties
 * from those objects. Assumes that the service will respond with an object that has an Array property of the
 * objects requested.
 * 
 * @param {CreateBatchRequestFunction} createRequestFn - Function called with all of the paths requested to create
 *  the request object to be used with the service.
 * @param {string} serviceName - The service name constant of the service to call with the request.
 * @param {RequestFunction} requestFn - Function that should call the appropriate method on the service client
 *  and return a Promise with the response from the service.
 * @param {BatchMatchingFunction} matchFn - Function called to match each path that was requested in the batch
 *  to the objects returned in the service's response.
 * @param {PropPicker} propPicker - The function to pick the requested property values from each response object
 *  returned from the service.
 * @returns {GetRouteHandler} A route handler for Falcor get requests.
 */
export function batchedServiceRequest(createRequestFn, serviceName, requestFn, matchFn, propPicker) {
  let handleErrors = handleRequestErrors(serviceName);
  
  return function doBatchedServiceRequest(pathSet) {
    pathSet = expandPathSet(pathSet);
    
    const propsIdx = pathSet.length - 1;
    const reqIdx = propsIdx - 1;
    
    // Generate initial paths and request based on all paths
    let paths = generatePaths(reqIdx, pathSet);
    let request = createRequestFn(paths);
    
    // Do request with the client
    let promise = getServiceClientAsync(serviceName)
      .then(client => requestFn(request, client))
      .catch(handleErrors);
        
    // Wait for request to finish, then match response values in the batch to paths and pick props from those values
    let pickResponseValues = R.partial(pickResponseValuesForBatch, [ matchFn, paths ]);
    const props = pathSet[propsIdx];
    let pickProps = R.zipWith(R.partial(pickPropsFromResponse, [ propPicker, props ]), paths);
    return promise.then(R.pipe(pickResponseValues, pickProps, R.unnest));
  };
};