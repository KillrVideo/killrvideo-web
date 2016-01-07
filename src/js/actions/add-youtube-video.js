import { createAction } from 'redux-actions';
import { isUndefined } from 'lodash';
import { Promise } from 'lib/promise';

import { change, blur } from 'redux-form';
import { showCommonDetails, hideCommonDetails } from './add-video';

import { createActionTypeConstants } from './promises';
import getYouTubeClient from 'lib/youtube-client';
import parseYouTubeVideoId from 'lib/parse-youtube-video-id';

// Rejected promises for common errors
const YOUTUBE_NOT_AVAILABLE = Promise.reject({ youTubeUrl: 'YouTube is currently not available. Please try again later.' });
YOUTUBE_NOT_AVAILABLE.suppressUnhandledRejections();

const INVALID_YOUTUBE_URL = Promise.reject({ youTubeUrl: 'Could not find a YouTube video at this URL' });
INVALID_YOUTUBE_URL.suppressUnhandledRejections();

/**
 * Action type constants
 */

const VALIDATE_YOUTUBE_URL = 'addVideo/VALIDATE_YOUTUBE_URL';
const SET_YOUTUBE_VIDEO = 'addVideo/SET_YOUTUBE_VIDEO';

// Public action types
export const ActionTypes = {
  VALIDATE_YOUTUBE_URL: createActionTypeConstants(VALIDATE_YOUTUBE_URL),
  SET_YOUTUBE_VIDEO: createActionTypeConstants(SET_YOUTUBE_VIDEO),
  CLEAR_YOUTUBE_VIDEO: 'addVideo/CLEAR_YOUTUBE_VIDEO'
};

/**
 * Private helper functions
 */
function lookupYouTubeVideo(youtube) {
  return youtube.videos.list({ part: 'snippet', id: this.videoId })
    .then(response => {
      if (isUndefined(response.result) || isUndefined(response.result.items) || response.result.items.length !== 1) {
        return INVALID_YOUTUBE_URL;
      }
    
      // Return the video details
      return {
        videoId: this.videoId,
        snippet: response.result.items[0].snippet 
      }; 
    }, () => YOUTUBE_NOT_AVAILABLE);
}

function updateForm(videoDetails) {
  const { snippet, videoId } = videoDetails;
  
  // Update some values on the addVideo form
  this.dispatch(change('addVideo', 'name', snippet.title));
  this.dispatch(change('addVideo', 'description', snippet.description));

  // Show the common video details entry section
  this.dispatch(showCommonDetails());
  
  // Return the video Id
  return {
    videoId
  };
}


/**
 * Action creators
 */

// Private action creator for clearing the YouTube video Id
const clearYouTubeVideo = createAction(ActionTypes.CLEAR_YOUTUBE_VIDEO);

// Asynchronous validation of the YouTube URL
export function validateYouTubeUrl(youTubeUrl) {
  return (dispatch, getState) => {
    // Sanity check (sync validation should ensure this doesn't happen)
    const videoId = parseYouTubeVideoId(youTubeUrl);
    if (isUndefined(videoId)) {
      throw new Error('Invalid YouTube video URL');
    }
    
    // Cancel any existing promise
    const { addVideo: { sourceSpecific: { _validationPromise: existingPromise } } } = getState();
    if (existingPromise) {
      existingPromise.cancel();
    }
    
    // We don't want async validation to finish until they click the button to set selection,
    // so create a promise that we can manually trigger to allow that
    let allowValidationToComplete;
    const allowValidationPromise = new Promise(resolve => { allowValidationToComplete = resolve; });
    
    // Create a promise representing looking up the video Id with the YouTube client API
    const promise = getYouTubeClient()
      .catchReturn(YOUTUBE_NOT_AVAILABLE)
      .bind({ videoId })
      .then(lookupYouTubeVideo)
      .finally(() => allowValidationPromise);   // Will wait for allowValidationPromise to resolve before passing through success/failure
    
    // Dispatch the promise so we can store the validation promise and the function for allowing
    // it to complete in state
    dispatch({
      type: VALIDATE_YOUTUBE_URL,
      payload: { 
        promise, 
        data: { 
          promise,
          allowValidationToComplete 
        }
      }
    });
    
    // Return the validation promise so redux-form knows it's in progress
    return promise;
  };
};

// Set the YouTube video selection
export function setYouTubeVideoSelection() {
  return (dispatch, getState) => {
    // Get the validation promise (which should be in progress) and the function we can
    // invoke to allow it to resolve/reject
    const { 
      addVideo: { 
        sourceSpecific: { 
          _validationPromise: validationPromise,
          _allowValidationToComplete: allowValidationToComplete
        }
      }
    } = getState();
    
    // Create a promise that will take the snippet from the YouTube API and if the lookup was
    // successful and set some of those values as default values on the addVideo form
    const promise = validationPromise.bind({ dispatch }).then(updateForm);
    
    // Dispatch the promise
    dispatch({
      type: SET_YOUTUBE_VIDEO,
      payload: { promise }
    });
    
    // Allow the promise to proceed
    allowValidationToComplete();
    
    // Return the promise
    return promise;
  };
};

// Clear the YouTube video selection
export function clearYouTubeVideoSelection() {
  return dispatch => {
    dispatch(hideCommonDetails());
    dispatch(clearYouTubeVideo());
  };
};