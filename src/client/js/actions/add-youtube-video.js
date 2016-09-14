import { createAction } from 'redux-actions';
import { isUndefined } from 'lodash';
import { Promise } from 'lib/promise';

import { model } from 'stores/falcor-model';
import { change } from 'redux-form';

import { createActionTypeConstants } from './promises';
import { getYouTubeClient } from 'lib/youtube-client';
import parseYouTubeVideoId from 'lib/parse-youtube-video-id';
import { ExtendableError } from 'lib/extendable-error';
import { deepFind } from 'lib/deep-find';
import { throwAsReduxFormError } from 'lib/redux-form-error';

// Custom error classes that have a youTubeUrl property with a failure message
class YouTubeNotAvailable extends ExtendableError {
  constructor() {
    super('YouTube is currently not available. Please try again later.');
    this.youTubeUrl = this.message;
  }
}

class InvalidYouTubeUrl extends ExtendableError {
  constructor() {
    super('Could not find a YouTube video at this URL');
    this.youTubeUrl = this.message;
  }
}

/**
 * Action type constants
 */

const VALIDATE_YOUTUBE_URL = 'addVideo/VALIDATE_YOUTUBE_URL';
const ADD_YOUTUBE_VIDEO = 'addVideo/ADD_YOUTUBE_VIDEO';

// Public action types
export const ActionTypes = {
  VALIDATE_YOUTUBE_URL: createActionTypeConstants(VALIDATE_YOUTUBE_URL),
  SET_YOUTUBE_VIDEO: 'addVideo/SET_YOUTUBE_VIDEO',
  ADD_YOUTUBE_VIDEO: createActionTypeConstants(ADD_YOUTUBE_VIDEO),
  CLEAR_YOUTUBE_VIDEO: 'addVideo/CLEAR_YOUTUBE_VIDEO'
};

/**
 * Private helper functions
 */
function lookupYouTubeVideo(youtube) {
  // The YouTube client uses its own Promise library, so wrap with Promise.resolve to convert to bluebird promise
  return Promise.resolve(youtube.videos.list({ part: 'snippet', id: this.videoId }))
    .catchThrow(new YouTubeNotAvailable())
    .then(response => {
      if (isUndefined(response.result) || isUndefined(response.result.items) || response.result.items.length !== 1) {
        throw new InvalidYouTubeUrl();
      }
    
      // Return the video details
      return {
        videoId: this.videoId,
        snippet: response.result.items[0].snippet 
      }; 
    });
}

function updateForm(videoDetails) {
  const { snippet, videoId } = videoDetails;
  
  // Update some values on the addVideo form
  this.dispatch(change('addVideo', 'name', snippet.title));
  this.dispatch(change('addVideo', 'description', snippet.description));
  
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
    
    // See what the current async validation state is
    const {
      config: { youTubeApiKey },
      addVideo: {
        youTube: { 
          _youTubeUrl: validatedYouTubeUrl, 
          _validationPromise: existingPromise
        } 
      }
    } = getState();
    
    if (existingPromise) {
      // Is the URL we're validating the same as the current promise?
      if (validatedYouTubeUrl === youTubeUrl) {
        return existingPromise;
      }
      
      // Cancel existing validation so we can start again
      existingPromise.cancel();
    }
    
    // We don't want async validation to finish until they click the button to set selection,
    // so create a promise that we can manually trigger to allow that
    let allowValidationToComplete;
    const allowValidationPromise = new Promise(resolve => { allowValidationToComplete = resolve; });
    
    // Create a promise representing looking up the video Id with the YouTube client API
    const promise = getYouTubeClient(youTubeApiKey)
      .catchThrow(new YouTubeNotAvailable())
      .bind({ videoId })
      .then(lookupYouTubeVideo)
      // Once we have the video Id from YouTube, prepopulate the form with some video details from the API
      .bind({ dispatch })
      .then(updateForm)
      // Wait for allowValidationPromise to resolve before passing through success/failure
      .then(
        val => { return allowValidationPromise.return(val); },
        err => { return allowValidationPromise.throw(err); }
      );

    // Dispatch the promise so we can store the validation promise and the function for allowing
    // it to complete in state
    return dispatch({
      type: VALIDATE_YOUTUBE_URL,
      payload: {
        promise,
        data: {
          youTubeUrl,
          promise,
          allowValidationToComplete
        }
      }
    });
  };
};

// Set the YouTube video selection
export function setYouTubeVideoSelection() {
  return (dispatch, getState) => {
    // Get the function which will lets us tell validation to go ahead and return a value/error 
    const { 
      addVideo: {
        youTube: {
          _allowValidationToComplete: allowValidationToComplete
        }
      }
    } = getState();

    // Tell everyone we're trying to set the YouTube video
    let returnVal = dispatch({
      type: ActionTypes.SET_YOUTUBE_VIDEO
    });

    // Allow validation to go ahead
    allowValidationToComplete();

    return returnVal;
  };
};

// Add a YouTube video to the site
export function addYouTubeVideo(vals) {
  return (dispatch, getState) => {
    const { addVideo: { youTube: { youTubeVideoId } } } = getState();
    
    const promise = model.call([ 'videosById', 'addYouTube' ], [ youTubeVideoId, vals.name, vals.description, vals.tags ])
      .catch(throwAsReduxFormError)
      .then(response => {
        // Find the video Id that was added in the response
        let addedVideoId = deepFind('videoId', response.json.videosById);
        return { addedVideoId };
      });
      
    dispatch({
      type: ADD_YOUTUBE_VIDEO,
      payload: { promise }
    });
    
    return promise;
  };
};

// Clear the YouTube video selection
export const clearYouTubeVideoSelection = createAction(ActionTypes.CLEAR_YOUTUBE_VIDEO);