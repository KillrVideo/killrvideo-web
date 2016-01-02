import { ActionTypes as YouTubeActions } from 'actions/add-youtube-video';
import { ActionTypes as UploadActions } from 'actions/add-uploaded-video';
import { combineReducers } from 'redux';
import { isArray } from 'lodash';
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
  statusMessage: 'The upload status message',
  statusMessageStyle: 'info',
  percentComplete: 0
};

// Reducer for upload-specific state
function upload(state = uploadDefaultState, action) {
  let statusMessage;
  
  switch (action.type) {
    case UploadActions.UPLOAD_VIDEO.LOADING:
      return {
        ...state,
        statusMessage: 'Starting upload process',
        statusMessageStyle: 'info',
        percentComplete: 0
      };
    
    case UploadActions.UPLOAD_VIDEO_PROGRESS:
      return {
        ...state,
        statusMessage: action.payload.statusMessage,
        percentComplete: action.payload.percentComplete
      };
    
    case UploadActions.UPLOAD_VIDEO.SUCCESS:
      return {
        ...state,
        statusMessage: 'Video uploaded successfully',
        statusMessageStyle: 'success',
        percentComplete: 100
      };
      
    case UploadActions.UPLOAD_VIDEO.FAILURE:
      return {
        ...state,
        statusMessage: 'An unexpected error occurred. Please try again later.',
        statusMessageStyle: 'danger'
      };
      
    
    
  }
  
  return state;
}

// Export reducer
export default combineReducers({
  common,
  youTube,
  upload
});