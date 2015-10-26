import createAction from 'redux-actions/lib/createAction';
import model from 'stores/falcor-model';
import { first, values } from 'lodash';

/**
 * Public action constants
 */
export const VIDEO_REQUESTED = 'viewVideo/VIDEO_REQUESTED';
export const VIDEO_RECEIVED = 'viewVideo/VIDEO_RECEIVED';
export const COMMENTS_REQUESTED = 'viewVideo/COMMENTS_REQUESTED';
export const COMMENTS_RECEIVED = 'viewVideo/COMMENTS_RECEIVED';

/**
 * Public action creators.
 */
export function getVideo(videoId, falcorQueries) {
  return dispatch => {
    let queries = falcorQueries.map(q => [ 'videosById', videoId, ...q ]);
    
    // Tell the UI we're loading
    dispatch(requestVideo(queries));
    
    // Do the falcor query and then dispatch the results
    return model.get(...queries).then(response => {
      dispatch(receiveVideo(first(values(response.json.videosById))));
    });
  };
};

export function loadMoreComments() {
  
}

/**
 * Private action creators
 */
const requestVideo = createAction(VIDEO_REQUESTED, falcorQueries => ({ falcorQueries }));
const receiveVideo = createAction(VIDEO_RECEIVED, video => ({ video }));
const requestComments = createAction(COMMENTS_REQUESTED);
const receiveComments = createAction(COMMENTS_RECEIVED);

