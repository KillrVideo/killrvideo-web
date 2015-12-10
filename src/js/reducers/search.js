import { combineReducers } from 'redux';
import { isUndefined } from 'lodash';
import * as Actions from 'actions/search';

import { createPagedReducer } from './paged';

// Default state for the search box
const defaultSearchBoxState = {
  suggestions: []
};

// Reducer for the search box state
function searchBox(state = defaultSearchBoxState, action) {
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