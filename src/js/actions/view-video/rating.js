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

export function rateVideo(rating, videoQueries) {
  return (dispatch, getState) => {
    const { router: { params: { videoId } } } = getState();
    
    // Rate the video and if successful, return the rating as the action's payload
    const promise = model.call([ 'videosById', videoId, 'rate' ], [ rating ], [], videoQueries)
      .then(response => response.json.videosById[videoId]);
    
    dispatch({
      type: RATE_VIDEO,
      payload: {
        promise,
        data: { promise, rating }
      }
    });
    
    return promise;
  };
};

export function getCurrentUserRating() {
  return (dispatch, getState) => {
    const { router: { params: { videoId } } } = getState();
    
    const promise = model.get([ 'currentUser', 'ratings', videoId, 'rating' ])
      .then(response => isUndefined(response) ? { rating: 0 } : response.json.currentUser.ratings[videoId]);
      
    dispatch({
      type: GET_CURRENT_USER_RATING,
      payload: {
        promise,
        data: { promise }
      }
    });
    
    return promise;
  };
};