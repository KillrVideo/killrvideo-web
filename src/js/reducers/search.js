import { combineReducers } from 'redux';
import { isUndefined } from 'lodash';
import * as Actions from 'actions/search';

// Default state for the search box
const defaultSearchBoxState = {
  suggestions: []
};

// Reducer for the search box state
function searchBox(state = defaultSearchBoxState, action) {
  return state;
}

// Default state for search results
const defaultResultsState = {
  _previewsModel: null,
  _morePreviewsAvailable: false,
  
  isLoading: false,
  previews: [],
  currentPageIndex: 0
};

// Reducer for the search results state
function results(state = defaultResultsState, action) {
  let _previewsModel, _morePreviewsAvailable, isLoading, previews, currentPageIndex, restOfState;
  
  switch (action.type) {
    case Actions.REQUEST_RESULTS:
      ({ isLoading, ...restOfState } = state);
      return {
        isLoading: true,
        ...restOfState
      };
      
    case Actions.RECEIVE_RESULTS:
      ({ isLoading, previews, _previewsModel, _morePreviewsAvailable, ...restOfState } = state);
      return {
        _previewsModel: isUndefined(action.payload.previewsModel) ? _previewsModel : action.payload.previewsModel,
        _morePreviewsAvailable: action.payload.morePreviewsAvailable,
        
        isLoading: false,
        previews: [ ...previews, ...action.payload.previews ],
        ...restOfState
      };
      
    case Actions.NEXT_PAGE:
      ({ currentPageIndex, ...restOfState } = state);
      return {
        currentPageIndex: currentPageIndex + Actions.RESULTS_PER_PAGE,
        ...restOfState
      };
      
    case Actions.PREVIOUS_PAGE:
      ({ currentPageIndex, ...restOfState } = state);
      return {
        currentPageIndex: currentPageIndex - Actions.RESULTS_PER_PAGE,
        ...restOfState
      };
      
    case Actions.RESET_RESULTS:
      return defaultResultsState;
  }
  
  return state;
}

const search = combineReducers({
  searchBox,
  results
});

export default search;