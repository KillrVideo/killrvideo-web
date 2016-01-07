import { commonFields, commonInitialValues, commonConstraints } from './add-video-form-common';
import { validateForm } from 'lib/validation';
import VideoLocationTypes from 'lib/video-location-types';

import { ActionTypes as CommonActions } from 'actions/add-video';
import { ActionTypes as UploadActions } from 'actions/add-uploaded-video';

const uploadDefaultState = {
  _promise: null,
  
  statusMessage: 'The upload status message',
  statusMessageStyle: 'info',
  percentComplete: 0,
  
  // Common state returned by all sources
  videoLocationType: VideoLocationTypes.UPLOAD,
  form: {
    fields: [ 'uploadUrl', ...commonFields ],
    initialValues: {
      uploadUrl: '',
      ...commonInitialValues
    },
    validate(vals) {
      return validateForm(vals, {
        uploadUrl: { presence: true },
        ...commonConstraints
      });
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
        _promise: action.payload.promise,
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