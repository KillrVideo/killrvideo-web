import createAction from 'redux-actions/lib/createAction';
import model from 'stores/falcor-model';
import { values, isUndefined } from 'lodash';

import { createPagedActions } from './paged';

/**
 * Public action constants
 */
export const VIDEO_RESET = 'videoVideo/VIDEO_RESET';
export const VIDEO_REQUESTED = 'viewVideo/VIDEO_REQUESTED';
export const VIDEO_RECEIVED = 'viewVideo/VIDEO_RECEIVED';

export const ADD_COMMENT_RESET = 'viewVideo/ADD_COMMENT_RESET';
export const ADD_COMMENT_REQUESTED = 'viewVideo/ADD_COMMENT_REQUESTED';
export const ADD_COMMENT_RECEIVED = 'viewVideo/ADD_COMMENT_RECEIVED';
export const ADD_ANOTHER_COMMENT = 'viewVideo/ADD_ANOTHER_COMMENT';

/**
 * Private action creators
 */
const resetVideo = createAction(VIDEO_RESET);
const requestVideo = createAction(VIDEO_REQUESTED);
const receiveVideo = createAction(VIDEO_RECEIVED, (video) => ({ video }));

const comments = createPagedActions(state => state.viewVideo.comments);

const requestAddComment = createAction(ADD_COMMENT_REQUESTED);
const receiveAddComment = createAction(ADD_COMMENT_RECEIVED, comment => ({ comment }));
const resetAddComment = createAction(ADD_COMMENT_RESET);

/**
 * Public action creators.
 */

export function load(videoId, videoQueries, commentQueries) {
  return dispatch => {
    const queryRoot = [ 'videosById', videoId ];
    
    // Get video
    dispatch(requestVideo());
    
    videoQueries = videoQueries.map(q => [ ...queryRoot, ...q ]);
    model.get(...videoQueries).then(
      response => dispatch(receiveVideo(response.json.videosById[videoId])),
      errors => console.error(errors));
    
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

export function addComment(videoId, comment, commentQueries) {
  return dispatch => {
    // Tell the UI we're trying to add the comment
    dispatch(requestAddComment());
    
    commentQueries = commentQueries.map(q => [ 'addedComments', 0, ...q ]);
    model.call([ 'videosById', videoId, 'comments', 'add' ], [ comment ], [], commentQueries).then(response => {
      dispatch(receiveAddComment(response.json.videosById[videoId].comments.addedComments[0]));
    });
  };
};

export const addAnotherComment = createAction(ADD_ANOTHER_COMMENT);

