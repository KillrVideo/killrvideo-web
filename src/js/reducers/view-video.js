import * as ActionTypes from 'actions/view-video';

// Reducer for the view video screen data
export default function viewVideo(state = { video: {}, isLoading: false }, action) {
  switch(action.type) {
    case ActionTypes.VIEW_VIDEO_REQUESTED:
      let { isLoading, ...restOfState } = state;
      return {
        isLoading: true,
        ...restOfState
      };
    case ActionTypes.VIEW_VIDEO_RECEIVED:
      return {
        isLoading: false,
        video: action.payload.video
      };
    default:
      return state;
  }
}