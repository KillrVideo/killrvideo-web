import { ActionTypes } from 'actions/view-video/details';
import { ActionTypes as RatingActionTypes } from 'actions/view-video/rating'; 

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
    
    case ActionTypes.RECORD_PLAYBACK.SUCCESS:
    case RatingActionTypes.RATE_VIDEO.SUCCESS:
      // Merge in any new data about the video
      return {
        ...state,
        video: {
          ...state.video,
          ...action.payload
        }
      };
  }
  
  return state;
}

// Export reducer
export default details;