import createAction from 'redux-actions/lib/createAction';
import model from 'stores/falcor-model';
import { join } from 'bluebird';
import { _, isUndefined } from 'lodash';

export const COMMENTS_PER_REQUEST = 5;

/**
 * Public action constants
 */
export const UNLOAD = 'viewVideo/UNLOAD';
export const VIDEO_REQUESTED = 'viewVideo/VIDEO_REQUESTED';
export const VIDEO_RECEIVED = 'viewVideo/VIDEO_RECEIVED';

export const COMMENTS_REQUESTED = 'viewVideo/COMMENTS_REQUESTED';
export const COMMENTS_MODEL_RECEIVED = 'viewVideo/COMMENTS_MODEL_RECEIVED';
export const COMMENTS_RECEIVED = 'viewVideo/COMMENTS_RECEIVED';

export const ADD_COMMENT_REQUESTED = 'viewVideo/ADD_COMMENT_REQUESTED';
export const ADD_COMMENT_RECEIVED = 'viewVideo/ADD_COMMENT_RECEIVED';

/**
 * Private action creators
 */
const requestVideo = createAction(VIDEO_REQUESTED);
const receiveVideo = createAction(VIDEO_RECEIVED, (video) => ({ video }));
const requestComments = createAction(COMMENTS_REQUESTED);
const receiveCommentsModel = createAction(COMMENTS_MODEL_RECEIVED, model => ({ model }));
const receiveComments = createAction(COMMENTS_RECEIVED, comments => ({ comments }));
const requestAddComment = createAction(ADD_COMMENT_REQUESTED);
const receiveAddComment = createAction(ADD_COMMENT_RECEIVED, comment => ({ comment }));

// Gets video details from the server
function getVideoDetails(videoId, videoQueries) {
  return dispatch => {
    // Tell the UI we're loading
    dispatch(requestVideo());
    
    const queries = videoQueries.map(q => [ 'videosById', videoId, ...q ]);
    return model.get(...queries).then(response => {
      const video = response.json.videosById[videoId];
      if (isUndefined(video)) {
        // TODO: Handle bad video ids
      } else {
        return dispatch(receiveVideo(video));
      }
    }, errors => {
      // TODO: Error handling
    });
  };
}

// Gets a page of comments from the server
function getComments(commentQueries) {
  return (dispatch, getState) => {
    // Get the model observable from state
    let { viewVideo: { videoComments: { _model: commentsModel } } } = getState();
    
    // Use the model to execute the queries and dispatch the results
    return commentsModel.get(...commentQueries).then(response => {
      // Possible to get undefined for response if there were no comments
      const comments = isUndefined(response) ? [] : _(response.json).values().value();
      return dispatch(receiveComments(comments));
    });
  };
}

// Get the initial page of comments for the video (and save the model for future requests to load more)
function getInitialComments(videoId, commentQueries) {
  return dispatch => {
    // Tell the UI we're loading
    dispatch(requestComments());
    
    let queries = commentQueries.map(q => [ { from: 0, length: COMMENTS_PER_REQUEST }, ...q ]);
    
    // Deref the comments (the server should return a stable view of comments for paging purposes)
    return model.deref([ 'videosById', videoId, 'comments' ], queries).toPromise().then(commentsModel => {
      dispatch(receiveCommentsModel(commentsModel));
      return dispatch(getComments(queries));
    });
  };
}

/**
 * Public action creators.
 */
export function load(videoId, videoQueries, commentQueries) {
  return dispatch => {
    // Return promise that will be resolved when both video and comments are finished loading
    return join(
      dispatch(getVideoDetails(videoId, videoQueries)),
      dispatch(getInitialComments(videoId, commentQueries))
    );
  }
};

export const unload = createAction(UNLOAD);

export function loadMoreComments(commentQueries) {
  return (dispatch, getState) => {
    // Sanity check
    let { viewVideo: { videoComments: { _startIdx: startIdx, moreCommentsAvailable } } } = getState();
    if (moreCommentsAvailable === false) return;
    
    // Tell the UI we're loading
    dispatch(requestComments());
    
    let queries = commentQueries.map(q => [ { from: startIdx, length: COMMENTS_PER_REQUEST }, ...q ]);
    return dispatch(getComments(queries));
  };
}

export function addComment(comment) {
  return (dispatch, getState) => {
    // Tell the UI we're trying to add the comment
    dispatch(requestAddComment());
    
    // Get model from comment state
    let { viewVideo: { videoComments: { _model: commentsModel } } } = getState();
    
    return commentsModel.call([ 'add' ], [ comment ]).then(response => {
      console.log(response);
    }, errors => {
      console.log(errors);
    });
  };
};

