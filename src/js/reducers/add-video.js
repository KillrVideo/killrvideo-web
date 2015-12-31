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
  percentComplete: 0,
  
  _uploadDestinationUrl: null
};

const UNEXPECTED_FAILURE_MESSAGE = 'An unexpected error occurred. Please try again later.';

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
        statusMessageStyle: 'danger'
      };
      
    case UploadActions.GENERATE_UPLOAD_DESTINATION.LOADING:
      return {
        ...state,
        statusMessage: 'Preparing to upload video'
      };
      
    case UploadActions.GENERATE_UPLOAD_DESTINATION.SUCCESS:
      return {
        ...state,
        percentComplete: 1,
        _uploadDestinationUrl: action.payload.json.uploads.destinationUrl
      };
      
    case UploadActions.GENERATE_UPLOAD_DESTINATION.FAILURE:
      // We'll get an array back if the server responded with some kind of "business logic" failure 
      statusMessage = isArray(action.payload)
        ? action.payload[0].value
        : UNEXPECTED_FAILURE_MESSAGE;
      
      return {
        ...state,
        statusMessage
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