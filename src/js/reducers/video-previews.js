import * as Actions from 'actions/video-previews';
import { mapValues } from 'lodash';
import { combineReducers } from 'redux';

// Reducer for the private state of all lists
function privateAllLists(state = {}, action) {
  // Dispatch actions that private state cares about to the appropriate list
  switch (action.type) {
    case Actions.LOAD:
    case Actions.UNLOAD:
    case Actions.RECEIVE_PREVIEWS_MODEL:
    case Actions.RECEIVE_PREVIEWS:
      let { [ action.payload.list ]: privateState, ...restOfState } = state;
      return {
        [ action.payload.list ]: privateOneList(privateState, action),
        ...restOfState
      };
  }
  
  return state;
}

const defaultPrivateOneList = {
  startIndex: 0,
  previewsQueryRoot: null,
  previewsModel: null,
  morePreviewsAvailable: false
};

// Reducer for the private state of an individual list
function privateOneList(state = defaultPrivateOneList, action) {
  let startIndex, previewsQueryRoot, previewsModel, morePreviewsAvailable, restOfState;
  
  switch(action.type) {
    case Actions.LOAD:
      ({ previewsQueryRoot, ...restOfState } = state);
      return {
        previewsQueryRoot: action.payload.previewsQueryRoot,
        ...restOfState
      };
      
    case Actions.RECEIVE_PREVIEWS_MODEL:
      ({ previewsModel, ...restOfState } = state);
      return {
        previewsModel: action.payload.previewsModel,
        ...restOfState
      };
      
    case Actions.RECEIVE_PREVIEWS:
      ({ startIndex, morePreviewsAvailable, ...restOfState } = state);
      return {
        startIndex: startIndex + action.payload.previews.length,
        morePreviewsAvailable: action.payload.morePreviewsAvailable,
        ...restOfState
      };
      
    case Actions.UNLOAD:
      return defaultPrivateOneList;
  }
  
  return state;
}

function publicAllLists(state = {}, action) {
  // Dispatch actions that public state cares about to the appropriate list
  switch (action.type) {
    case Actions.LOAD:
    case Actions.UNLOAD:
    case Actions.REQUEST_PREVIEWS:
    case Actions.RECEIVE_PREVIEWS:
    case Actions.NEXT_PAGE:
    case Actions.PREVIOUS_PAGE:
      let { [ action.payload.list ]: publicState, ...restOfState } = state;
      return {
        [ action.payload.list ]: publicOneList(publicState, action),
        ...restOfState
      };
  }
  
  return state;
}

const defaultPublicOneList = { 
  isLoading: false, 
  previews: [],
  currentPageIndex: 0
};

function publicOneList(state = defaultPublicOneList, action) {
  let isLoading, previews, currentPageIndex, restOfState;
  
  switch (action.type) {
    case Actions.REQUEST_PREVIEWS:
      ({ isLoading, ...restOfState } = state);
      return {
        isLoading: true,
        ...restOfState
      };
      
    case Actions.RECEIVE_PREVIEWS:
      ({ isLoading, previews, ...restOfState } = state);
      return {
        isLoading: false,
        previews: [ ...previews, ...action.payload.previews ],
        ...restOfState
      };
      
    case Actions.NEXT_PAGE:
      ({ currentPageIndex, ...restOfState } = state);
      return {
        currentPageIndex: currentPageIndex + Actions.PREVIEW_INDEX_CHANGE_PER_PAGE,
        ...restOfState
      };
      
    case Actions.PREVIOUS_PAGE:
      ({ currentPageIndex, ...restOfState } = state);
      return {
        currentPageIndex: currentPageIndex - Actions.PREVIEW_INDEX_CHANGE_PER_PAGE,
        ...restOfState
      };
      
    case Actions.LOAD:
    case Actions.UNLOAD:
      return defaultPublicOneList;
  }
  return state;
}

const videoPreviews = combineReducers({
  lists: publicAllLists,
  _private: privateAllLists
});

export default videoPreviews;