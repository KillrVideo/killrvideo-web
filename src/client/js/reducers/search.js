import { combineReducers } from 'redux';
import { isUndefined } from 'lodash';
import { ActionTypes } from 'actions/search';

import { createPagedReducer } from './paged';

// Default state for the search box
const defaultSearchBoxState = {
  _suggestionsPromise: null,
  suggestions: []
};

// Reducer for the search box state
function searchBox(state = defaultSearchBoxState, action) {
  let p = state._suggestionsPromise;
  
  switch(action.type) {
    case ActionTypes.CLEAR_SUGGESTIONS:
    case ActionTypes.GET_SUGGESTIONS.FAILURE:
      if (p !== null) p.cancel();
      return defaultSearchBoxState;
      
    case ActionTypes.GET_SUGGESTIONS.LOADING:
      if (p !== null) p.cancel();
      return {
        ...state,
        _suggestionsPromise: action.payload.promise,
        suggestions: []
      };
      
    case ActionTypes.GET_SUGGESTIONS.SUCCESS:
      return {
        ...state,
        _suggestionsPromise: null,
        suggestions: action.payload
      };
  }
  return state;
}

// Create reducer for search results
const SEARCH_RESULTS_LIST_ID = 'searchResults';
const SEARCH_RESULTS_PAGING_CONFIG = {
  recordsPerPage: 8,
  recordsPerRequest: 20
};
const results = createPagedReducer(SEARCH_RESULTS_LIST_ID, SEARCH_RESULTS_PAGING_CONFIG);

// Export search reducer
const search = combineReducers({
  searchBox,
  results
});

export default search;