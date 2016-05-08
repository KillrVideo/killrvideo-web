import R from 'ramda';

import { isError, toRef } from './sentinels';
import { getPropsWithPropPicker, getFirstArrayProp } from './props';

const EMPTY_LIST_VALUE = 'EMPTY';
const NO_TOKEN_VALUE = 'NONE';

const getListPath = R.converge(R.append, [
  R.pipe(R.last, pv => pv += 'List'),
  R.dropLast(1)
]);

/**
 * Clears the paging state cache for the lists at the specified paths.
 */
export function clearPagingStateCache(pagingStateCache, paths) {
  let listPaths = R.map(getListPath, paths);
  listPaths.forEach(listPath => {
    pagingStateCache.clearKey(listPath.join('_'));
  });
};

/**
 * Creates a token ref for the list at the specified path where the token is just a dummy placeholder
 * token. Useful for lists that don't support starting tokens but we want to follow the conventions
 * for lists that do.
 */
export function createDummyTokenRef(path) {
  let listPath = getListPath(path);
  return { path, value: toRef(R.append(NO_TOKEN_VALUE, listPath)) };
};

/**
 * Create a token ref for the list at the specified path from the response using the propPicker to
 * pick the values from the token props specified.
 */
export function createTokenRef(propPicker, tokenProps, path, response) {
  // Just bail on errors
  if (isError(response)) {
    return { path, value: response };
  }
  
  // Find the reponse prop that is a list
  response = getFirstArrayProp(response);
  
  let listPath = getListPath(path);
  let token = EMPTY_LIST_VALUE;
  if (R.isEmpty(response) === false) {
    token = getPropsWithPropPicker(propPicker, tokenProps, R.head(response)).join('_');
  }
  
  return { path, value: toRef(R.append(token, listPath)) };
};

/**
 * Given an index and a path, returns true if that element is an empty list token.
 */
export const isEmptyToken = R.curryN(2, R.pipe(R.nth, R.equals(EMPTY_LIST_VALUE)));