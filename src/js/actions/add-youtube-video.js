import { createAction } from 'redux-actions';
import { isUndefined } from 'lodash';
import { Promise } from 'bluebird';
import { change } from 'redux-form';

import { createActionTypeConstants } from './promises';
import getYouTubeClient from 'lib/youtube-client';
import parseYouTubeVideoId from 'lib/parse-youtube-video-id';

const YOUTUBE_NOT_AVAILABLE = Promise.reject({ youTubeUrl: [ 'YouTube is currently not available. Please try again later.' ] });
YOUTUBE_NOT_AVAILABLE.suppressUnhandledRejections();

const INVALID_YOUTUBE_URL = Promise.reject({ youTubeUrl: [ 'Could not find a YouTube video at this URL' ] });
INVALID_YOUTUBE_URL.suppressUnhandledRejections();

/**
 * Action type constants
 */

const SET_YOUTUBE_VIDEO = 'addVideo/SET_YOUTUBE_VIDEO';

// Public action types
export const ActionTypes = {
  SET_YOUTUBE_VIDEO: createActionTypeConstants(SET_YOUTUBE_VIDEO),
  CLEAR_YOUTUBE_VIDEO: 'addVideo/CLEAR_YOUTUBE_VIDEO'
};


/**
 * Public action creators
 */

// Set the YouTube video selection
export function setYouTubeVideoSelection(youTubeVideoUrl) {
  const videoId = parseYouTubeVideoId(youTubeVideoUrl);
  if (isUndefined(videoId)) {
    throw new Error('Invalid YouTube video URL');
  }
  
  return dispatch => {
    const promise = getYouTubeClient().then(youtube => {
      return youtube.videos.list({ part: 'snippet', id: videoId }).then(response => {
        if (isUndefined(response.result) || isUndefined(response.result.items) || response.result.items.length !== 1) {
          return INVALID_YOUTUBE_URL;
        }
        
        // Update some values on the addVideo form
        const snippet = response.result.items[0].snippet;
        dispatch(change('addVideo', 'name', snippet.title));
        dispatch(change('addVideo', 'description', snippet.description));
        dispatch(change('addVideo', 'location', videoId));
        return {
          videoId
        };
      }, () => YOUTUBE_NOT_AVAILABLE);
    }, () => YOUTUBE_NOT_AVAILABLE);
    
    dispatch({
      type: SET_YOUTUBE_VIDEO,
      payload: { promise }
    });
    
    // Return the promise so redux-form will know about any errors
    return promise;
  };
  
  
};

export const clearYouTubeVideoSelection = createAction(ActionTypes.CLEAR_YOUTUBE_VIDEO);