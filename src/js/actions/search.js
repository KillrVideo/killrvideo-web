import createAction from 'redux-actions/lib/createAction';
import model from 'stores/falcor-model';
import { isUndefined, values } from 'lodash';

import { createPagedActions } from './paged';

/**
 * Private action creators
 */

const results = createPagedActions(state => state.search.results);

/**
 * Public action creators
 */

// Get initial seach results for a term
export function searchFor(term, previewsQueries) {
  const queryRoot = [ 'search', `query=${term}` ];
  return results.getInitialPage(queryRoot, previewsQueries);
};

// Go to next page of search results
export const nextPageClick = results.nextPageClick;

// Go to previous page of search results
export const previousPageClick = results.previousPageClick;

// Unload search results
export const unload = results.unload;