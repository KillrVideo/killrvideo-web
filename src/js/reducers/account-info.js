import { ActionTypes } from 'actions/account-info';
import { combineReducers } from 'redux';

import { createPagedReducer } from './paged';

// Default state for the user profile info
const defaultUserInfo = {
  isLoading: false
};

// Reducer for the user profile info
function user(state = defaultUserInfo, action) {
  switch (action.type) {
    case ActionTypes.RESET_USER:
      return defaultUserInfo;
      
    case ActionTypes.GET_USER.LOADING:
      return {
        isLoading: true
      };
    
    case ActionTypes.GET_USER.SUCCESS:
      return {
        isLoading: false,
        ...action.payload
      };
    case ActionTypes.GET_USER.FAILURE:
      return {
        isLoading: false
      };
  }
  
  return state;
}

// Create reducers for user's comments and videos
const COMMENTS_LIST_ID = 'userComments';
const COMMENTS_PAGING_CONFIG = {
  recordsPerPage: 5,
  recordsPerRequest: 10
};
const comments = createPagedReducer(COMMENTS_LIST_ID, COMMENTS_PAGING_CONFIG);

const VIDEOS_LIST_ID = 'userVideos';
const VIDEOS_PAGING_CONFIG = {
  recordsPerPage: 10
};
const videos = createPagedReducer(VIDEOS_LIST_ID, VIDEOS_PAGING_CONFIG);

const accountInfo = combineReducers({
  user,
  comments,
  videos
});

export default accountInfo;