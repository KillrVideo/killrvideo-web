import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';

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