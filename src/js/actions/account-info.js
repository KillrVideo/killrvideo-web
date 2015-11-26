import createAction from 'redux-actions/lib/createAction';
import model from 'stores/falcor-model';
import { isUndefined, values } from 'lodash';

const COMMENTS_PER_REQUEST = 10;
const PREVIEWS_PER_REQUEST = 10;

/**
 * Action type constants
 */
export const RESET =  'accountInfo/RESET';

export const REQUEST_USER = 'accountInfo/REQUEST_USER';
export const RECEIVE_USER = 'accountInfo/RECEIVE_USER';

export const REQUEST_USER_COMMENTS = 'accountInfo/REQUEST_USER_COMMENTS';
export const RECEIVE_USER_COMMENTS = 'accountInfo/RECEIVE_USER_COMMENTS';

export const REQUEST_USER_VIDEOS = 'accountInfo/REQUEST_USER_VIDEOS';
export const RECEIVE_USER_VIDEOS = 'accountInfo/RECEIVE_USER_VIDEOS';


/**
 * Private action creators
 */
const reset = createAction(RESET);

const requestUser = createAction(REQUEST_USER);
const receiveUser = createAction(RECEIVE_USER, user => ({ user }));

const requestComments = createAction(REQUEST_USER_COMMENTS);
const receiveComments = createAction(RECEIVE_USER_COMMENTS, (comments, moreCommentsAvailable, commentsModel) => ({ comments, moreCommentsAvailable, commentsModel }));

const requestVideos = createAction(REQUEST_USER_VIDEOS);
const receiveVideos = createAction(RECEIVE_USER_VIDEOS, (previews, morePreviewsAvailable, previewsModel) => ({ previews, morePreviewsAvailable, previewsModel }));

/**
 * Public action creators
 */

export function load(userId, userQueries, commentsQueries, previewsQueries) {
  return dispatch => {
    // Reset any current state
    dispatch(reset());
    
    const queryRoot = isUndefined(userId) ? [ 'currentUser' ] : [ 'usersById', userId ];
    const userSelector = isUndefined(userId) 
      ? response => response.json.currentUser 
      : response => response.json.usersById[userId];
    
    // Get user info
    dispatch(requestUser());
    
    userQueries = userQueries.map(q => [ ...queryRoot, ...q ]);
    model.get(...userQueries).then(response => {
      const user = isUndefined(response) ? undefined : userSelector(response);
      dispatch(receiveUser(user));
    });
    
    // Get user comments
    dispatch(requestComments());
    
    commentsQueries = commentsQueries.map(q => [ { from: 0, length: COMMENTS_PER_REQUEST }, ...q ]);
    let commentsModel = null;
    model.deref([ ...queryRoot, 'comments' ], ...commentsQueries).subscribe(
      m => { commentsModel = m; },
      null, // TODO: Error handler?
      () => {
        // Possible to get no comments back and thus not have a model
        if (commentsModel === null) {
          dispatch(receiveComments([], false));
          return;
        }
        
        // Get the comments and return
        commentsModel.get(...commentsQueries).then(response => {
          const comments = isUndefined(response) ? [] : values(response.json);
          const moreCommentsAvailable = comments.length === COMMENTS_PER_REQUEST;
          dispatch(receiveComments(comments, moreCommentsAvailable, commentsModel));
        });
      });
      
    // Get user video previews
    dispatch(requestVideos());
    
    previewsQueries = previewsQueries.map(q => [ { from: 0, length: PREVIEWS_PER_REQUEST }, ...q]);
    let previewsModel = null;
    model.deref([ ...queryRoot, 'videos' ], ...previewsQueries).subscribe(
      m => { previewsModel = m; },
      null, // TODO: Error handler?
      () => {
        // Possible to get no video previews back and thus not have a model
        if (previewsModel === null) {
          dispatch(receiveVideos([], false));
          return;
        }
        
        // Get the previews and return
        previewsModel.get(...previewsQueries).then(response => {
          const previews = isUndefined(response) ? [] : values(response.json);
          const morePreviewsAvailable = previews.length === PREVIEWS_PER_REQUEST;
          dispatch(receiveVideos(previews, morePreviewsAvailable, previewsModel));
        });
      });
  };
};

export function loadMoreComments() {
  
};

export function videosNextPageClick() {
  
};

export function videosPreviousPageClick() {
  
};

// When unloading, just reset the state
export const unload = reset;