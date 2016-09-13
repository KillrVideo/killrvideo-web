import { createAction } from 'redux-actions';
import { model } from 'stores/falcor-model';

import { createActionTypeConstants } from './promises';
import { createPagedActions } from './paged';

const GET_SUGGESTIONS = 'search/GET_SUGGESTIONS';

export const ActionTypes = {
  GET_SUGGESTIONS: createActionTypeConstants(GET_SUGGESTIONS),
  CLEAR_SUGGESTIONS: 'search/CLEAR_SUGGESTIONS'
};

/**
 * Private action creators
 */

const results = createPagedActions(state => state.search.results);
const clearSuggestions = createAction(ActionTypes.CLEAR_SUGGESTIONS);

/**
 * Public action creators
 */

// Get initial seach results for a term
export function searchFor(term, previewsQueries) {
  const queryRoot = [ 'search', term, 'results' ];
  return results.getInitialPage(queryRoot, previewsQueries);
};

// Go to next page of search results
export const nextPageClick = results.nextPageClick;

// Go to previous page of search results
export const previousPageClick = results.previousPageClick;

// Unload search results
export const unload = results.unload;

// Get search term suggestions
export function getSuggestions(term) {
  return dispatch => {
    if (!term)
      return dispatch(clearSuggestions());
    
    const promise = model.get([ 'search', term, 'suggestions'])
      .catchReturn([])
      .then(response => {
        if (!response) return [];
        return response.json.search[term].suggestions; 
      });
    
    dispatch({
      type: GET_SUGGESTIONS,
      payload: {
        promise,
        data: { promise }
      }
    });
    
    return promise;
  };
}