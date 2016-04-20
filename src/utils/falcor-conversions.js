import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import { explodePaths } from './falcor-utils';
import R from 'ramda';

const aliasedProp = R.curry((keysMap, key, obj) => {
  let keyMap = keysMap[key];
  switch (typeof keyMap) {
    case 'undefined':
      return obj[key];
    case 'string':
      return obj[keyMap];
    case 'function':
      return keyMap(obj);
    default:
      throw new Error(`Unknown keysMap type ${typeof keyMap} for key ${key}`);
  }
});

const valueOrConverted = R.curry((valuesMap, key, value) => {
  let c = valuesMap[key];
  return c ? c(value) : value;
});

/**
 * Creates a pick function that will pick a specified prop from an object using the supplied
 * key map to look up values in the object and the specified values map to convert the values
 * found at the key.
 */
// (prop, obj) => propVal
export function responsePicker(theMap) {
  // If the map has the key passed in, use the function from the map to get the value from the object, otherwise 
  // just use R.prop to pull the value
  return R.ifElse(
    R.has(R.__, theMap),
    R.converge(R.call, [ R.prop(R.__, theMap), R.nthArg(1) ]),
    R.prop
  );
};

/**
 * Gets path values from a response that contains a single object. Uses the picker function specified to pick props
 * from the response object. Picks props for all paths in the exploded paths from the pathSet.
 */
export const getPathValuesFromResponse = R.curry((picker, pathSet, response) => {
  // Assume that the prop requested will be the last value in a path (pathSet and a path should be the same length)
  const propIdx = pathSet.length - 1;
  return explodePaths(pathSet).map(path => {
    let prop = path[propIdx];
    return {
      path,
      value: picker(prop, response)
    };
  });
});

/**
 * Wraps a value in an atom.
 */
export const toAtom = $atom;

/**
 * Returns whether the given value is an atom.
 */
export const isAtom = isSentinel('atom');

/**
 * Wraps a value in an error.
 */
export const toError = $error;

/**
 * Returns whether the given value is an error.
 */
export const isError = isSentinel('error');

/**
 * Wraps a value in a reference.
 */
export const toRef = $ref;

/**
 * Returns whether the given value is a reference.
 */
export const isRef = isSentinel('ref');

/**
 * Wraps a value in an array.
 */
export function toArray(value) {
  return [ value ];
};

/**
 * Helper function to determine if a value is a sentinel.
 */
function isSentinel(t) {
  return val => {
    return val['$type'] === t;
  };
}
