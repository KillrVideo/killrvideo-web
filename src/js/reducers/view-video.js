import * as Actions from 'actions/view-video';
import { _, merge, keys, last } from 'lodash';

const defaultState = {
  video: {},
  videoLoading: false,
  comments: {},
  commentsLoading: false,
  moreCommentsAvailable: false
};

// Helper function to determine if more comments are available
function areMoreCommentsAvailable(comments) {
  const lastCommentIdx = parseInt(_(comments).keys().last());
  if (isNaN(lastCommentIdx)) 
    return false;
    
  // There are possibly more comments left if we got a full page of comments
  return (lastCommentIdx + 1) % Actions.COMMENTS_PER_REQUEST === 0;
}

// Reducer for the view video screen data
export default function viewVideo(state = defaultState, action) {
  let video, videoLoading, comments, commentsLoading, moreCommentsAvailable, restOfState;
  
  switch(action.type) {
    case Actions.VIDEO_REQUESTED:
      ({ videoLoading, commentsLoading, ...restOfState } = state);
      return {
        videoLoading: true,
        commentsLoading: true,
        ...restOfState
      };
    case Actions.VIDEO_RECEIVED:
      ({ video, videoLoading, comments, commentsLoading, moreCommentsAvailable, ...restOfState } = state);
      return {
        videoLoading: false,
        commentsLoading: false,
        video: action.payload.video,    // Replace any existing video data with payload's video,
        comments: action.payload.comments,
        moreCommentsAvailable: areMoreCommentsAvailable(action.payload.comments),
        ...restOfState
      };
    case Actions.COMMENTS_REQUESTED:
      ({ commentsLoading, ...restOfState } = state);
      return {
        commentsLoading: true,
        ...restOfState
      };
    case Actions.COMMENTS_RECEIVED:
      ({ comments, commentsLoading, moreCommentsAvailable, ...restOfState } = state);
      return {
        commentsLoading: false,
        comments: merge({}, comments, action.payload.comments), // Merge new comments into existing video state
        moreCommentsAvailable: areMoreCommentsAvailable(action.payload.comments),
        ...restOfState
      };
  }
  
  return state;
}