import { model } from 'stores/falcor-model';
import { createActionTypeConstants } from 'actions/promises';
import { isUndefined } from 'lodash';

/**
 * Action type constants
 */

const RATE_VIDEO = 'viewVideo/RATE_VIDEO';
const GET_CURRENT_USER_RATING = 'viewVideo/GET_CURRENT_USER_RATING';

export const ActionTypes = {
  RATE_VIDEO: createActionTypeConstants(RATE_VIDEO),
  GET_CURRENT_USER_RATING: createActionTypeConstants(GET_CURRENT_USER_RATING)
};

/**
 * Actions
 */

export function rateVideo(videoId, rating, videoQueries) {
  // Rate the video and if successful, return the rating as the action's payload
  const promise = model.call([ 'videosById', videoId, 'rate' ], [ rating ], [], videoQueries)
    .then(response => response.json.videosById[videoId]);
  
  return {
    type: RATE_VIDEO,
    payload: {
      promise,
      data: { promise, rating }
    }
  };
};

export function getCurrentUserRating(videoId) {
  const promise = model.get([ 'currentUser', 'ratings', videoId, 'rating' ])
    .then(response => isUndefined(response) ? { rating: 0 } : response.json.currentUser.ratings[videoId]);
    
  return {
    type: GET_CURRENT_USER_RATING,
    payload: {
      promise,
      data: { promise }
    }
  };
};