import createAction from 'redux-actions/lib/createAction';
import model from 'stores/falcor-model';
import { _, first, values, keys, last, isUndefined } from 'lodash';

export const COMMENTS_PER_REQUEST = 5;

/**
 * Public action constants
 */
export const VIDEO_REQUESTED = 'viewVideo/VIDEO_REQUESTED';
export const VIDEO_RECEIVED = 'viewVideo/VIDEO_RECEIVED';
export const COMMENTS_REQUESTED = 'viewVideo/COMMENTS_REQUESTED';
export const COMMENTS_RECEIVED = 'viewVideo/COMMENTS_RECEIVED';


/**
 * Private action creators
 */
const requestVideo = createAction(VIDEO_REQUESTED, falcorQueries => ({ falcorQueries }));
const receiveVideo = createAction(VIDEO_RECEIVED, (video, comments) => ({ video, comments }));
const requestComments = createAction(COMMENTS_REQUESTED, falcorQueries => ({ falcorQueries }));
const receiveComments = createAction(COMMENTS_RECEIVED, comments => ({ comments }));


/**
 * Public action creators.
 */
export function getVideo(videoId, videoQueries, commentQueries) {
  return dispatch => {
    // Run all the video and comment queries together
    let queries = [
      ...videoQueries.map(q => [ 'videosById', videoId, ...q ]),
      ...commentQueries.map(q => [ 'videosById', videoId, 'comments', { from: 0, length: COMMENTS_PER_REQUEST }, ...q ])
    ];
    
    // Tell the UI we're loading
    dispatch(requestVideo(queries));
    
    // Do the falcor query and then dispatch the results
    return model.get(...queries).then(response => {
      // TODO: Handle invalid video id and undefined response
      let data = _(response.json.videosById).values().first();
      let { comments, ...video } = data;
      return dispatch(receiveVideo(video, comments));
    });
  };
};

export function loadMoreComments(videoId, commentQueries) {
  return (dispatch, getState) => {
    // Sanity check
    let {
      viewVideo: {
        comments,
        moreCommentsAvailable
      }
    } = getState();
    
    if (moreCommentsAvailable === false) return;

    // Figure out the starting index for the next page of comments and create the queries    
    let startIdx = parseInt(_(comments).keys().last()) + 1;
    let queries = commentQueries.map(q => [ 'videosById', videoId, 'comments', { from: startIdx, length: COMMENTS_PER_REQUEST }, ...q ]);
    
    // Tell the UI comments are loading
    dispatch(requestComments(queries));
    
    // Do the queries and then dispatch the results
    return model.get(...queries).then(response => {
      // It's possible to get undefined back for the response if there are no comments left to load
      // so account for that by returning an empty object for video
      let comments = isUndefined(response) ? {} : _(response.json.videosById).values().first().comments; 
      return dispatch(receiveComments(comments));
    });
  };
}

