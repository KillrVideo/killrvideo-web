import { ActionTypes } from 'actions/view-video';
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
    case ActionTypes.RESET_VIDEO:
      return defaultVideoDetails;
      
    case ActionTypes.GET_VIDEO.LOADING:
      return {
        isLoading: true,
        video: null
      };
      
    case ActionTypes.GET_VIDEO.SUCCESS:
      return {
        isLoading: false,
        video: action.payload
      };
      
    case ActionTypes.GET_VIDEO.FAILURE:
      return {
        ...state,
        isLoading: false
      };
      
    case ActionTypes.UPDATE_VIDEO_LOCATION:
      return {
        ...state,
        video: {
          ...state.video,
          location: action.payload.location
        }
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
    case ActionTypes.ADD_COMMENT_RESET:
      return defaultAddedComments;
      
    case ActionTypes.ADD_COMMENT.LOADING:
      return {
        ...state,
        isLoading: true
      };
      
    case ActionTypes.ADD_COMMENT.SUCCESS:
      return {
        isLoading: false,
        commentAdded: true,
        comments: [ action.payload, ...state.comments ]
      };
      
    case ActionTypes.ADD_COMMENT.FAILURE:
      return {
        ...state,
        isLoading: false
      };
      
    case ActionTypes.ADD_ANOTHER_COMMENT:
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

// Create reducer for showing similar videos
const MORE_LIKE_THIS_LIST_ID = 'moreLikeThis';
const MORE_LIKE_THIS_PAGING_CONFIG = {
  recordsPerPage: 5,
  incrementIndexPerPage: 4,
  recordsPerRequest: 20
};
const moreLikeThis = createPagedReducer(MORE_LIKE_THIS_LIST_ID, MORE_LIKE_THIS_PAGING_CONFIG);

const viewVideo = combineReducers({
  details,
  comments,
  addedComments,
  moreLikeThis
});

export default viewVideo;

