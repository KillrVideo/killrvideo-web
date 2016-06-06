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

export function listReferenceWithDummyToken() {
  return function doListReferenceWithDummyToken(pathSet) {
    pathSet = expandPathSet(pathSet);
    
    const listIdx = pathSet.length - 1;
    
    let paths = generatePaths(listIdx, pathSet);
    clearPagingStateCache(this.pagingStateCache, paths);
    return R.map(createDummyTokenRef, paths);
  };
};

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