import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import { explodePaths } from './falcor-utils';
import R from 'ramda';

const aliasedProp = R.curry((keysMap, key, obj) => {
  return obj[keysMap[key] || key];
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
export function responsePicker(keysMap, valuesMap) {
  const prop = aliasedProp(keysMap);
  const val = valueOrConverted(valuesMap);
  return (key, obj) => { return val(key, prop(key, obj)); };
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
 * Wraps a value in an error.
 */
export const toError = $error;

/**
 * Wraps a value in a reference.
 */
export const toRef = $ref;

/**
 * Wraps a value in an array.
 */
export function toArray(value) {
  return [ value ];
};
