import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';

/**
 * Returns a function that takes a key and a value. For a given key, if the config object provided has that
 * same key, the value will be converted using the function at that key in the config object, otherwise the
 * value is returned as-is. 
 */
export function convertValues(config) {
  return (key, val) => {
    let converter = config[key];
    if (converter) { 
      return converter(val);
    }
    return val;
  };
};

/**
 * Returns a function that takes a key and an object. For a given key, if the config object provided has that
 * key, the value of that config key is used as the key instead. The function then returns the value from the
 * object at the given key. 
 */
export function pickValues(config) {
  return (key, obj) => {
    let alias = config[key];
    if (alias) {
      key = alias;
    }
    return obj[key];
  };
}

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
