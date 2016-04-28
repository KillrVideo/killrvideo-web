import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import R from 'ramda';

/**
 * Creates a pick function that will pick a specified prop from an object using the supplied
 * key map to look up values in the object and the specified values map to convert the values
 * found at the key.
 */
export function responsePicker(theMap) {
  // If the map has the key passed in, use the function from the map to get the value from the object, otherwise 
  // just use R.prop to pull the value
  return R.ifElse(
    R.has(R.__, theMap),
    R.converge(R.call, [ R.prop(R.__, theMap), R.nthArg(1) ]),
    R.prop
  );
};
// map -> ((Str prop, a) -> b)

/**
 * A default response picker instance that just picks properties without mapping them at all.
 */
export const defaultResponsePicker = responsePicker({});

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
 * Helper function to determine if a value is a sentinel.
 */
function isSentinel(t) {
  return val => {
    return val ? val['$type'] === t : false;
  };
}
