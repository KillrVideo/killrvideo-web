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