import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
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
