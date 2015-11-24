import createAction from 'redux-actions/lib/createAction';
import model from 'stores/falcor-model';
import { join } from 'bluebird';
import { values, isUndefined } from 'lodash';

export const COMMENTS_PER_REQUEST = 5;

/**
 * Public action constants
 */
export const UNLOAD = 'viewVideo/UNLOAD';
export const VIDEO_REQUESTED = 'viewVideo/VIDEO_REQUESTED';
export const VIDEO_RECEIVED = 'viewVideo/VIDEO_RECEIVED';

export const COMMENTS_REQUESTED = 'viewVideo/COMMENTS_REQUESTED';
export const COMMENTS_RECEIVED = 'viewVideo/COMMENTS_RECEIVED';

export const ADD_COMMENT_REQUESTED = 'viewVideo/ADD_COMMENT_REQUESTED';
export const ADD_COMMENT_RECEIVED = 'viewVideo/ADD_COMMENT_RECEIVED';
export const ADD_ANOTHER_COMMENT = 'viewVideo/ADD_ANOTHER_COMMENT';

/**
 * Private action creators
 */
const requestVideo = createAction(VIDEO_REQUESTED);
const receiveVideo = createAction(VIDEO_RECEIVED, (video) => ({ video }));
const requestComments = createAction(COMMENTS_REQUESTED);
const receiveComments = createAction(COMMENTS_RECEIVED, (comments, commentsModel) => ({ comments, commentsModel }));
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

// Get the initial page of comments for the video (and save the model for future requests to load more)
function getInitialComments(videoId, commentQueries) {
  return dispatch => {
    // Tell the UI we're loading
    dispatch(requestComments());
    
    let queries = commentQueries.map(q => [ { from: 0, length: COMMENTS_PER_REQUEST }, ...q ]);
    
    let commentsModel = null;
    return model.deref([ 'videosById', videoId, 'comments' ], ...queries).subscribe(
      m => { commentsModel = m; },
      null, // TODO: Error handler?
      () => {
        // Possible to have a null model if there are no comments for the video
        if (commentsModel === null) {
          dispatch(receiveComments([]));
          return;
        }
        
        commentsModel.get(...queries).then(response => {
          // Possible to get undefined for response if there were no comments
          const comments = isUndefined(response) ? [] : values(response.json);
          dispatch(receiveComments(comments, commentsModel));
        });
      }
    );
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
    let { viewVideo: { videoComments: { _startIdx: startIdx, _model: commentsModel, moreCommentsAvailable } } } = getState();
    if (moreCommentsAvailable === false) return;
    
    // Tell the UI we're loading
    dispatch(requestComments());
    
    let queries = commentQueries.map(q => [ { from: startIdx, length: COMMENTS_PER_REQUEST }, ...q ]);
    return commentsModel.get(...queries).then(response => {
      // Possible to get undefined for response if there were no comments
      const comments = isUndefined(response) ? [] : values(response.json);
      dispatch(receiveComments(comments));
    });
  };
}

export function addComment(comment, commentQueries) {
  return (dispatch, getState) => {
    // Tell the UI we're trying to add the comment
    dispatch(requestAddComment());
    
    // Get the model observable from state
    let { viewVideo: { videoComments: { _model: commentsModel } } } = getState();
    
    const queries = commentQueries.map(q => [ 'addedComments', 0, ...q ]);
    return commentsModel.call([ 'add' ], [ comment ], [], queries).then(response => {
      return dispatch(receiveAddComment(response.json.addedComments[0]));
    });
  };
};

export const addAnotherComment = createAction(ADD_ANOTHER_COMMENT);

