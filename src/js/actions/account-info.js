import createAction from 'redux-actions/lib/createAction';
import model from 'stores/falcor-model';
import { isUndefined, values } from 'lodash';

// Number of video previews to show per page
export const PREVIEWS_PER_PAGE = 10;

// Number of comments to show per page
export const COMMENTS_PER_PAGE = 5;

// Number of video previews to get per request after the initial page
const PREVIEWS_PER_REQUEST = 10;

// Number of comments to get per request after the initial page
const COMMENTS_PER_REQUEST = 10;


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
export const NEXT_PAGE_USER_VIDEOS = 'accountInfo/NEXT_PAGE_USER_VIDEOS';
export const PREVIOUS_PAGE_USER_VIDEOS = 'accountInfo/PREVIOUS_PAGE_USER_VIDEOS';


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
const nextPageUserVideos = createAction(NEXT_PAGE_USER_VIDEOS);
const previousPageUserVideos = createAction(PREVIOUS_PAGE_USER_VIDEOS);

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
    
    commentsQueries = commentsQueries.map(q => [ { from: 0, length: COMMENTS_PER_PAGE }, ...q ]);
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
          const moreCommentsAvailable = comments.length === COMMENTS_PER_PAGE;
          dispatch(receiveComments(comments, moreCommentsAvailable, commentsModel));
        });
      });
      
    // Get user video previews
    dispatch(requestVideos());
    
    previewsQueries = previewsQueries.map(q => [ { from: 0, length: PREVIEWS_PER_PAGE }, ...q]);
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
          const morePreviewsAvailable = previews.length === PREVIEWS_PER_PAGE;
          dispatch(receiveVideos(previews, morePreviewsAvailable, previewsModel));
        });
      });
  };
};

export function loadMoreComments(commentsQueries) {
  
};

// Goto the next page of user videos, possibly going to the server to get more previews
export function videosNextPageClick(previewsQueries) {
  return (dispatch, getState) => {
    let {
      accountInfo: { videos: { _previewsModel: previewsModel, morePreviewsAvailable, previews, currentPageIndex } }
    } = getState();
    
    const nextPageStartIdx = currentPageIndex + PREVIEWS_PER_PAGE;
    const alreadyHaveSomeOfNextPage = previews.length > nextPageStartIdx;
    
    // Are we out of pages on the server?
    if (morePreviewsAvailable === false) {
      // If we already have some/all of the next page, just go to the next page
      return alreadyHaveSomeOfNextPage ? dispatch(nextPageUserVideos()) : undefined;
    }
    
    // Do we have the full next page to show without going to the server?   
    const nextPageEndIdx = nextPageStartIdx + PREVIEWS_PER_PAGE - 1;
    if (nextPageEndIdx < previews.length) {
      return dispatch(nextPageUserVideos());
    }
    
    // There are more pages available on the server and we need them, so go get them then go to the next page
    dispatch(requestVideos());
    
    const queries = previewsQueries.map(q => [ { from: previews.length, length: PREVIEWS_PER_REQUEST }, ...q ]);
    return previewsModel.get(...queries).then(response => {
      // Dispatch any previews we received
      const newPreviews = isUndefined(response) ? [] : values(response.json);
      const morePreviewsAvailable = newPreviews.length === PREVIEWS_PER_REQUEST;
      dispatch(receiveVideos(newPreviews, morePreviewsAvailable));
      
      // If we got an empty page of previews, make sure we actually have records on the next page to show
      if (newPreviews.length === 0 && alreadyHaveSomeOfNextPage === false) {
        return;
      }
      
      dispatch(nextPageUserVideos());
    });
  };
};

// Goto the previous page of video previews
export function videosPreviousPageClick() {
  return (dispatch, getState) => {
    // Make sure we're not on the first page
    let {
      accountInfo: { videos: { currentPageIndex } }
    } = getState();
    
    return currentPageIndex === 0 ? undefined : dispatch(previousPageUserVideos());
  };
};

// When unloading, just reset the state
export const unload = reset;