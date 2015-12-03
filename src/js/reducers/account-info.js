import * as Actions from 'actions/account-info';
import { combineReducers } from 'redux';
import { isUndefined } from 'lodash';

// Default state for the user profile info
const defaultUserInfo = {
  isLoading: false
};

// Reducer for the user profile info
function user(state = defaultUserInfo, action) {
  switch (action.type) {
    case Actions.RESET:
      return defaultUserInfo;
      
    case Actions.REQUEST_USER:
      return {
        isLoading: true
      };
    
    case Actions.RECEIVE_USER:
      return {
        isLoading: false,
        ...action.payload.user
      };
  }
  
  return state;
}

// Default state for user comments
const defaultUserComments = {
  _commentsModel: null,
  
  moreCommentsAvailable: false,
  isLoading: false,
  comments: []
};

// Reducer for user comments
function comments(state = defaultUserComments, action) {
  let _commentsModel, moreCommentsAvailable, isLoading, comments, restOfState;
  
  switch(action.type) {
    case Actions.RESET:
      return defaultUserComments;
      
    case Actions.REQUEST_USER_COMMENTS:
      ({ isLoading, ...restOfState} = state);
      return {
        isLoading: true,
        ...restOfState
      };
      
    case Actions.RECEIVE_USER_COMMENTS:
      ({ _commentsModel, isLoading, comments, moreCommentsAvailable, ...restOfState } = state);
      return {
        _commentsModel: isUndefined(action.payload.commentsModel) ? _commentsModel : action.payload.commentsModel,
        isLoading: false,
        comments: [ ...comments, ...action.payload.comments ],
        moreCommentsAvailable: action.payload.moreCommentsAvailable,
        ...restOfState
      };
  }
  return state;
}

// Default state for user videos
const defaultUserVideos = {
  _previewsModel: null,
  
  morePreviewsAvailable: false,
  currentPageIndex: 0,
  isLoading: false,
  previews: [] 
};

// Reducer for user videos
function videos(state = defaultUserVideos, action) {
  let _previewsModel, morePreviewsAvailable, currentPageIndex, isLoading, previews, restOfState;
  
  switch(action.type) {
    case Actions.RESET:
      return defaultUserVideos;
      
    case Actions.REQUEST_USER_VIDEOS:
      ({ isLoading, ...restOfState } = state);
      return {
        isLoading: true,
        ...restOfState
      };
      
    case Actions.RECEIVE_USER_VIDEOS:
      ({ _previewsModel, morePreviewsAvailable, isLoading, previews, ...restOfState } = state);
      return {
        _previewsModel: isUndefined(action.payload.previewsModel) ? _previewsModel : action.payload.previewsModel,
        morePreviewsAvailable: action.payload.morePreviewsAvailable,
        isLoading: false,
        previews: [ ...previews, ...action.payload.previews ],
        ...restOfState
      };
    
    case Actions.NEXT_PAGE_USER_VIDEOS:
      ({ currentPageIndex, ...restOfState } = state);
      return {
        currentPageIndex: currentPageIndex + Actions.PREVIEWS_PER_PAGE,
        ...restOfState
      };
      
    case Actions.PREVIOUS_PAGE_USER_VIDEOS:
      ({ currentPageIndex, ...restOfState } = state);
      return {
        currentPageIndex: currentPageIndex - Actions.PREVIEWS_PER_PAGE,
        ...restOfState
      };
  }
  
  return state;
}

const accountInfo = combineReducers({
  user,
  comments,
  videos
});

export default accountInfo;