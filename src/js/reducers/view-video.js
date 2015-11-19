import * as Actions from 'actions/view-video';
import { _, isNull, isUndefined } from 'lodash';
import { combineReducers } from 'redux';


// Default state for the video's details
const defaultVideoDetails = {
  isLoading: false,
  video: null
};

// Reducer for the video's details
function videoDetails(state = defaultVideoDetails, action) {
  switch(action.type) {
    case Actions.UNLOAD:
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

// Default state for the video's comments
const defaultVideoComments = {
  _pagingToken: null,
  
  isLoading: false,
  comments: [],
  moreCommentsAvailable: false,
  addingComment: false,
  commentAdded: false
};

// Reducer for the video's comments state
function videoComments(state = defaultVideoComments, action) {
  let _model, _startIdx, isLoading, comments, moreCommentsAvailable, addingComment, commentAdded, restOfState;
  
  switch (action.type) {
    case Actions.UNLOAD:
      return defaultVideoComments;
      
    case Actions.COMMENTS_REQUESTED:
      ({ isLoading, ...restOfState } = state);
      return {
        isLoading: true,
        ...restOfState
      };
      
    case Actions.COMMENTS_MODEL_RECEIVED:
      ({ _model, _startIdx, comments, ...restOfState } = state);
      return {
        _startIdx: 0,
        _model: action.payload.model,
        comments: [],
        ...restOfState
      };
      
    case Actions.COMMENTS_RECEIVED:
      ({ _startIdx, isLoading, comments, moreCommentsAvailable, ...restOfState } = state);
      
      // More comments are available only if we got a full page of comments
      moreCommentsAvailable = action.payload.comments.length === Actions.COMMENTS_PER_REQUEST;
      
      return {
        _startIdx: _startIdx + Actions.COMMENTS_PER_REQUEST,
        isLoading: false,
        comments: [ ...comments, ...action.payload.comments ],
        moreCommentsAvailable,
        ...restOfState
      };
      
    case Actions.ADD_COMMENT_REQUESTED:
      ({ addingComment, ...restOfState } = state);
      return {
        addingComment: true,
        ...restOfState
      };
      
    case Actions.ADD_COMMENT_RECEIVED:
      ({ addingComment, commentAdded, comments, ...restOfState } = state);
      return {
        addingComment: false,
        commentAdded: true,
        comments: [ action.payload.comment, ...comments ],
        ...restOfState
      };
      
    case Actions.ADD_ANOTHER_COMMENT:
      ({ commentAdded, ...restOfState } = state);
      return {
        commentAdded: false,
        ...restOfState
      };
  }
  
  return state;
}



const viewVideo = combineReducers({
  videoDetails,
  videoComments
});

export default viewVideo;

