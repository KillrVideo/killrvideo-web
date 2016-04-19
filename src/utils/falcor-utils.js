import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';

/**
 * Gets an array of indexes from an array of Falcor ranges.
 */
export function getIndexesFromRanges(ranges) {
  let idxs = [];
  for (let i = 0; i < ranges.length; i++) {
    let range = ranges[i];
    for (let j = range.from; j <= range.to; j++) {
      idxs.push(j);
    }
  }
  return idxs;
};

/**
 * Groups a list of indexes by available paging states and returns an array of objects.
 */
export function groupIndexesByPagingState(idxs, pagingStates) {
  let results = [];
  let psIdx = 0;
  let newPage = true;
  
  // Make sure indexes are in order from low to high
  const indexes = idxs.sort((a, b) => { return a - b });
  
  for (let indexesIdx = 0; indexesIdx < indexes.length; indexesIdx++) {
    let curIdx = indexes[indexesIdx];
    
    // Find the index in paging states that's appropriate for the current index
    while (psIdx < pagingStates.length - 1 && curIdx >= pagingStates[psIdx + 1].startingIndex) {
      psIdx++;
      newPage = true;
    }
    
    // If this is a new page, add the result object to our results array
    if (newPage === true) {
      let { startingIndex, pagingState } = pagingStates[psIdx];
      results.push({
        startingIndex,
        pagingState,
        indexes: [],
        isLastAvailablePagingState: (psIdx === pagingStates.length - 1)
      });
    }
    
    // Add the index to the results
    results[results.length - 1].indexes.push(curIdx);
    newPage = false;
  }
  
  return results;
};

export function getRequestPages(ranges, pagingStateCache, pagingStateCacheKey) {
  const pagingGroups = groupIndexesByPagingState(getIndexesFromRanges(ranges), pagingStateCache.getKey(pagingStateCacheKey));
  return pagingGroups.map(pagingGroup => ({
    /**
     * Does a paged request and returns a Promise with the response.
     */
    doRequest(requestFn, request) {
      const { startingIndex, pagingState, indexes, isLastAvailablePagingState } = pagingGroup;
      const pageSize = indexes[indexes.length - 1] - startingIndex + 1;
      const pagedRequest = {
        pageSize, 
        pagingState
      };
      Object.getOwnPropertyNames(request).forEach(prop => { pagedRequest[prop] = request[prop]; });
      
      let requestPromise = requestFn(pagedRequest);
      
      // Save the paging state if this is the last available paging state
      if (pagingGroup.isLastAvailablePagingState) {
        requestPromise = requestPromise.tap(response => {
          if (response.pagingState !== '') {
            let nextStartingIndex = startingIndex + pageSize;
            pagingStateCache.saveKey(pagingStateCacheKey, nextStartingIndex, response.pagingState);
          }
        });
      }
      return requestPromise;
    },
    
    /**
     * For each index in the paged request, find the corresponding item in the response array and calls
     * the supplied mapperFn with the value (could be null) and the index of the request.
     */
    mapResponse(responseArray, mapperFn) {
      return pagingGroup.indexes.map((idx) => {
        const adjustedIdx = idx - pagingGroup.startingIndex;
        const item = responseArray.length > adjustedIdx
          ? responseArray[adjustedIdx]
          : null;
        
        return mapperFn(item, idx);
      });
    },
    
    /**
     * Runs the supplied mapper function against all indexes that were requested for this page.
     */
    mapIndexes(mapperFn) {
      return pagingGroup.indexes.map(idx => mapperFn(idx));
    }
  }));
};

/**
 * Takes an array of arrays of path values and flattens it.
 */
export function flattenPathValues(pathValues) {
  return [].concat.apply([], pathValues);
};

/**
 * A constant that can be used to indicate a list is empty.
 */
export const EMPTY_LIST_VALUE = 'NONE';

function noOp() { }

/**
 * Returns a function that takes a service response from a paged query and saves the paging state
 * if necessary.
 */
export function savePagingStateIfNecessary(pagingStateGroup, pagingStateCache, pagingStateCacheKey) {
  // No need to save paging state if not the last available paging state
  if (pagingStateGroup.isLastAvailablePagingState === false) {
    return noOp;
  }
  
  return (response) => {
    // Save paging state from response if necessary
    if (response.pagingState !== '') {
      let nextStartingIndex = pagingStateGroup.indexes[pagingStateGroup.indexes.length - 1] + 1;
      pagingStateCache.saveKey(pagingStateCacheKey, nextStartingIndex, response.pagingState);
    }
  };
};

/**
 * Returns an empty path value (i.e. path with value set to atom) for the specified path.
 */
export function toEmptyPathValue(path) {
  return { path, value: $atom() };
};

/**
 * Explodes a pathSet to paths at the specified depth of the pathSet and returns the array of paths.
 */
export function explodePaths(pathSet, depthIdx) {
  if (!depthIdx) depthIdx = pathSet.length - 1;
  
  if (depthIdx >= pathSet.length) {
    throw new Error('Depth index is too large');
  }
  
  let paths = [];
  for (let path of getPaths(pathSet, depthIdx)) {
    paths.push(path);
  }
  return paths;
};

function* getPaths(pathSet, maxDepthIdx, curDepthIdx) {
  if (!curDepthIdx) curDepthIdx = 0;
  
  let path;
  for (let val of getPathSetValues(pathSet, curDepthIdx)) {
    if (curDepthIdx === maxDepthIdx) {
      path = new Array(maxDepthIdx + 1);
      path[curDepthIdx] = val;
      yield path;
    } else {
      for (path of getPaths(pathSet, maxDepthIdx, curDepthIdx + 1)) {
        path[curDepthIdx] = val;
        yield path;
      }
    }
  }
}

function* getPathSetValues(pathSet, depthIdx) {
  let pathSetVal = pathSet[depthIdx];
  if (Array.isArray(pathSetVal) === false) {
    yield pathSetVal;
    return;
  }
  
  // See what type we're dealing with in the array by peeking at the first element
  let arrayValType = typeof pathSetVal[0];
  if (arrayValType === 'object' && pathSetVal[0].hasOwnProperty('from')) {
    arrayValType = 'range';
  }
  
  for(let i = 0; i < pathSetVal.length; i++) {
    let arrayVal = pathSetVal[i];
    switch(arrayValType) {
      case 'string':
      case 'number':
        yield arrayVal;
        break;
      case 'range':
        for (let rangeIdx = arrayVal.from; rangeIdx <= arrayVal.to; rangeIdx++) {
          yield rangeIdx;
        }
        break;
      default:
        throw new Error(`Unknown pathSet value type ${arrayValType}`);
    }
  }
}