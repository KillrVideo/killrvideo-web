import R from 'ramda';

function numbersByValue(a, b) {
  return a - b;
}

const isArrayOfStringsOrNumbers = R.pipe(R.head, R.either(R.is(String), R.is(Number)));
// ([ obj ]) => bool

const getIndexesFromRanges = R.pipe(
  R.chain(R.converge(R.range, [ R.prop('from'), R.compose(R.inc, R.prop('to')) ])), 
  R.sort(numbersByValue)
);
// ([ { from, to } ]) => [ number ]

const expandPathSetValues = R.cond([
  // If a single value, just wrap in an array
  [R.complement(Array.isArray),     R.of],
  // If is an array of strings or numbers, just returns array vals as-is
  [isArrayOfStringsOrNumbers,       R.identity],
  // Otherwise we have an array of ranges so transform them to indexes
  [R.T,                             getIndexesFromRanges]
]);
// pathSetValues -> [ pathSetValues ]

/**
 * Given a pathSet, expands the pathSet into an array of the same size where each element in the
 * array is an array of strings/numbers (i.e. converts ranges to index values). 
 */
export const expandPathSet = R.map(expandPathSetValues);