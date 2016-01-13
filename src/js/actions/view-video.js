import { createAction } from 'redux-actions';
import { createActionTypeConstants } from './promises';
import model from 'stores/falcor-model';
import { values, isUndefined } from 'lodash';

import { createPagedActions } from './paged';

/**
 * Public action constants
 */
const GET_VIDEO = 'viewVideo/GET_VIDEO';

export const ActionTypes = {
  GET_VIDEO: createActionTypeConstants(GET_VIDEO),
  RESET_VIDEO: 'viewVideo/RESET_VIDEO',
  UPDATE_VIDEO_LOCATION: 'viewVideo.UPDATE_VIDEO_LOCATION',
  
  ADD_COMMENT_RESET: 'viewVideo/ADD_COMMENT_RESET',
  ADD_COMMENT_REQUESTED: 'viewVideo/ADD_COMMENT_REQUESTED',
  ADD_COMMENT_RECEIVED: 'viewVideo/ADD_COMMENT_RECEIVED',
  ADD_ANOTHER_COMMENT: 'viewVideo/ADD_ANOTHER_COMMENT'
};


/**
 * Private action creators
 */
const resetVideo = createAction(ActionTypes.RESET_VIDEO);

const comments = createPagedActions(state => state.viewVideo.comments);

const requestAddComment = createAction(ActionTypes.ADD_COMMENT_REQUESTED);
const receiveAddComment = createAction(ActionTypes.ADD_COMMENT_RECEIVED, comment => ({ comment }));
const resetAddComment = createAction(ActionTypes.ADD_COMMENT_RESET);

/**
 * Public action creators.
 */

export function load(videoQueries, commentQueries) {
  return (dispatch, getState) => {
    const { router: { params: { videoId } } } = getState();
    
    const queryRoot = [ 'videosById', videoId ];
    videoQueries = videoQueries.map(q => [ ...queryRoot, ...q ]);
    
    // Get the video and dispatch the promise
    const promise = model.get(...videoQueries)
      .then(response => response.json.videosById[videoId]);
      
    dispatch({
      type: GET_VIDEO,
      payload: { 
        promise,
        data: {
          promise
        } 
      }
    });
    
    // Get comments
    dispatch(comments.getInitialPage([ ...queryRoot, 'comments' ], commentQueries));
  };
};

export function unload() {
  return dispatch => {
    dispatch(resetVideo());
    dispatch(comments.unload());
    dispatch(resetAddComment());
  };
};

export const showMoreComments = comments.nextPageClick;

export function addComment(comment, commentQueries) {
  return (dispatch, getState) => {
    const { router: { params: { videoId } } } = getState();
    
    // Tell the UI we're trying to add the comment
    dispatch(requestAddComment());
    
    commentQueries = commentQueries.map(q => [ 'addedComments', 0, ...q ]);
    model.call([ 'videosById', videoId, 'comments', 'add' ], [ comment ], [], commentQueries).then(response => {
      dispatch(receiveAddComment(response.json.videosById[videoId].comments.addedComments[0]));
    });
  };
};

export const addAnotherComment = createAction(ActionTypes.ADD_ANOTHER_COMMENT);

export const moreLikeThis = createPagedActions(state => state.viewVideo.moreLikeThis);
moreLikeThis.load = function(queries) {
  return (dispatch, getState) => {
    const { router: { params: { videoId } } } = getState();
    return dispatch(moreLikeThis.getInitialPage([ 'videosById', videoId, 'relatedVideos' ], queries));
  };
};

// Allow the video location to be updated (for ex, after waiting on an upload to finish processing)
export const updateVideoLocation = createAction(ActionTypes.UPDATE_VIDEO_LOCATION, location => ({ location }));