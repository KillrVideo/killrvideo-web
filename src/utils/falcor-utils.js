/**
 * Gets an array of indexes from an array of Falcor ranges
 */
export function getIndexesFromRanges(ranges) {
  var idxs = [];
  for (let i = 0; i < ranges.length; i++) {
    let range = ranges[i];
    for (let j = range.from; j <= range.to; j++) {
      idxs.push(j);
    }
  }
  return idxs;
};

/**
 * Takes an array of arrays of path values and flattens it.
 */
export function flattenPathValues(pathValues) {
  return [].concat.apply([], pathValues);
};