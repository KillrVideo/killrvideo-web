import * as ActionTypes from 'actions/view-video';

const defaultState = {
  video: {},
  videoLoading: false,
  commentsLoading: false,
  moreCommentsAvailable: false
};

// Reducer for the view video screen data
export default function viewVideo(state = defaultState, action) {
  switch(action.type) {
    case ActionTypes.VIDEO_REQUESTED:
      let { videoLoading, commentsLoading, ...restOfState } = state;
      return {
        videoLoading: true,
        commentsLoading: true,
        ...restOfState
      };
    case ActionTypes.VIDEO_RECEIVED:
      let { videoLoading, commentsLoading, moreCommentsAvailable, video, ...restOfState } = state;
      return {
        videoLoading: false,
        commentsLoading: false,
        moreCommentsAvailable: true,
        video: action.payload.video,
        ...restOfState
      };
    case ActionTypes.COMMENTS_REQUESTED:
      return {
        
      };
    case ActionTypes.COMMENTS_RECEIVED:
      return {
        
      };
    default:
      
  }
  
  return state;
}