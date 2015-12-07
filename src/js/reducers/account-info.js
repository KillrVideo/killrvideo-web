import * as Actions from 'actions/account-info';
import { combineReducers } from 'redux';

import { createPagedReducer } from './paged';

// Default state for the user profile info
const defaultUserInfo = {
  isLoading: false
};

// Reducer for the user profile info
function user(state = defaultUserInfo, action) {
  switch (action.type) {
    case Actions.RESET_USER:
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

// Create reducers for user's comments and videos
const comments = createPagedReducer(Actions.COMMENTS_LIST_ID, Actions.COMMENTS_PAGING_CONFIG);
const videos = createPagedReducer(Actions.VIDEOS_LIST_ID, Actions.VIDEOS_PAGING_CONFIG);

const accountInfo = combineReducers({
  user,
  comments,
  videos
});

export default accountInfo;