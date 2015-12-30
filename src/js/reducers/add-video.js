import { ActionTypes as YouTubeActions } from 'actions/add-youtube-video';
import { combineReducers } from 'redux';
import VideoLocationTypes from 'lib/video-location-types';

const commonDefaultState = {
  videoId: null,
  showCommonDetails: false
};

// Reducer for common add video state
function common(state = commonDefaultState, action) {
  switch(action.type) {
    case YouTubeActions.CLEAR_YOUTUBE_VIDEO:
      return {
        ...state,
        showCommonDetails: false
      };
    case YouTubeActions.SET_YOUTUBE_VIDEO.SUCCESS:
      return {
        ...state,
        showCommonDetails: true
      };
  }
  return state;
}

const youTubeDefaultState = {
  videoId: null
};

// Reducer for youtube-specific state
function youTube(state = youTubeDefaultState, action) {
  switch (action.type) {
    case YouTubeActions.CLEAR_YOUTUBE_VIDEO:
      return youTubeDefaultState;
      
    case YouTubeActions.SET_YOUTUBE_VIDEO.SUCCESS:
      return {
        ...state,
        videoId: action.payload.videoId
      };
  }
  
  return state;
}

const uploadDefaultState = {
  
};

// Reducer for upload-specific state
function upload(state = uploadDefaultState, action) {
  return state;
}

// Export reducer
export default combineReducers({
  common,
  youTube,
  upload
});