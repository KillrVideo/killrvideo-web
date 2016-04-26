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
    // Indicate a range and sort the ranges from low to high
    arrayValType = 'range';
    pathSetVal = pathSetVal.sort((a, b) => { return a.from - b.from; });
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