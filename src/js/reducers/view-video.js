import * as Actions from 'actions/view-video';
import { _, isNull, isUndefined } from 'lodash';
import { combineReducers } from 'redux';

import { createPagedReducer } from './paged';


// Default state for the video's details
const defaultVideoDetails = {
  isLoading: false,
  video: null
};

// Reducer for the video's details
function details(state = defaultVideoDetails, action) {
  switch(action.type) {
    case Actions.VIDEO_RESET:
      return defaultVideoDetails;
      
    case Actions.VIDEO_REQUESTED:
      return {
        isLoading: true,
        video: null
      };
      
    case Actions.VIDEO_RECEIVED:
      return {
        isLoading: false,
        video: action.payload.video
      };
  }
  
  return state;
}

const defaultAddedComments = {
  isLoading: false,
  commentAdded: false,
  comments: []
};

function addedComments(state = defaultAddedComments, action) {
  switch (action.type) {
    case Actions.ADD_COMMENT_RESET:
      return defaultAddedComments;
      
    case Actions.ADD_COMMENT_REQUESTED:
      return {
        ...state,
        isLoading: true
      };
      
    case Actions.ADD_COMMENT_RECEIVED:
      return {
        isLoading: false,
        commentAdded: true,
        comments: [ action.payload.comment, ...state.comments ]
      };
      
    case Actions.ADD_ANOTHER_COMMENT:
      return {
        ...state,
        commentAdded: false
      };
  }
  
  return state;
}

// Create reducer for showing comments
const COMMENTS_LIST_ID = 'videoComments';
const COMMENTS_PAGING_CONFIG = {
  recordsPerPage: 5,
  recordsPerRequest: 10
};
const comments = createPagedReducer(COMMENTS_LIST_ID, COMMENTS_PAGING_CONFIG);

const viewVideo = combineReducers({
  details,
  comments,
  addedComments
});

export default viewVideo;

