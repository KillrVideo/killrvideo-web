import { commonFields, commonInitialValues, commonConstraints } from './add-video-form-common';
import { validateForm } from 'lib/validation';
import VideoLocationTypes from 'lib/video-location-types';

import { ActionTypes as CommonActions } from 'actions/add-video';
import { ActionTypes as UploadActions, uploadVideo } from 'actions/add-uploaded-video';

// Validation constraints
const constraints = {
  uploadFile: {
    presence: { message: '^Please select a video to upload' },
    fileMaxSize: { message: '^Video is too large, please select a smaller video', size: 1073741824 }  // Support uploads of up to 1 GB
  },
  ...commonConstraints
};

// Default state for upload
const uploadDefaultState = {
  _uploadPromise: null,
  
  uploadUrl: null,
  statusMessage: 'The upload status message',
  statusMessageStyle: 'info',
  percentComplete: 0,
  
  // Common state returned by all sources
  videoLocationType: VideoLocationTypes.UPLOAD,
  form: {
    fields: [ 'uploadFile', ...commonFields ],
    initialValues: {
      uploadFile: null,
      ...commonInitialValues
    },
    validate(vals) {
      return validateForm(vals, constraints);
    },
    onSubmit(vals) {
      console.log(vals);
    }
  }
};

// Reducer for upload-specific state
function upload(state = uploadDefaultState, action) {
  let statusMessage;
  
  switch (action.type) {
    // Changing source so return default state
    case CommonActions.SET_SOURCE:
      return uploadDefaultState;
      
    case UploadActions.CLEAR_UPLOAD_VIDEO_SELECTION:
      return uploadDefaultState;
      
    case UploadActions.UPLOAD_VIDEO.LOADING:
      return {
        ...state,
        _uploadPromise: action.payload.promise,
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

// Export the reducer
export default upload;