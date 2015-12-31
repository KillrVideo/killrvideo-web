import { createAction } from 'redux-actions';
import { isUndefined } from 'lodash';
import { Promise } from 'bluebird';
import model from 'stores/falcor-model';
import { createActionTypeConstants } from './promises';

/**
 * Action type constants
 */
const UPLOAD_VIDEO = 'addVideo/UPLOAD_VIDEO';
const GENERATE_UPLOAD_DESTINATION = 'addVideo/GENERATE_UPLOAD_DESTINATION'; 

// Public action types
export const ActionTypes = {
  UPLOAD_VIDEO: createActionTypeConstants(UPLOAD_VIDEO),
  GENERATE_UPLOAD_DESTINATION: createActionTypeConstants(GENERATE_UPLOAD_DESTINATION)
};

/**
 * Private helpers
 */

function checkForCancellation() {
  
}

function generateUploadDestination(fileName) {
  return dispatch => {
    const promise = model.call('uploads.generateDestination', [ fileName ], [], [ 'destinationUrl' ]);
    
    dispatch({
      type: GENERATE_UPLOAD_DESTINATION,
      payload: { promise }
    });
    
    return promise;
  };
}

/**
 * Public action creators
 */

export function uploadVideo(formVals) {
  return dispatch => {
    // Create a promise that we can manually trigger at the end of this method to start the upload
    let startUpload;
    const startPromise = new Promise(resolve => { startUpload = resolve; });
    
    // Create a promise to represent the entire upload process
    const promise = startPromise.then(file => dispatch(generateUploadDestination(file.name)));
    
    // Tell redux we're uploading a video
    dispatch({
      type: UPLOAD_VIDEO,
      payload: { promise }
    });
    
    // Start the upload process
    startUpload(formVals.uploadFile);
  };
};

export function cancelUpload() {
  
};