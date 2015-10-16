import createAction from 'redux-actions/lib/createAction';
import model from 'stores/falcor-model';
import { values } from 'lodash';

export const VIDEO_PREVIEW_LIST_REQUEST = 'VIDEO_PREVIEW_LIST_REQUEST';
export const VIDEO_PREVIEW_LIST_RECIEVE = 'VIDEO_PREVIEW_LIST_RECIEVE';

const videoPreviewListRequest = createAction(VIDEO_PREVIEW_LIST_REQUEST, (list, query) => ({ list, query }));
const videoPreviewListReceive = createAction(VIDEO_PREVIEW_LIST_RECIEVE, (list, idx, videos, getFalcorQuery) => ({ list, idx, videos, getFalcorQuery }));


// Async action for getting initial page
export function getVideos(list, getFalcorQuery) {
  return (dispatch, getState) => {
    // Query from whatever model root is in state with a starting index of 0
    let { 
      videoPreviewLists: { 
        _private: { 
          [list]: { modelRoot } 
        } 
      } 
    } = getState();
      
    return dispatch(fetchPageOfVideos(list, modelRoot, 0, getFalcorQuery));
  };
};

// Async action for getting next page in a list
export function nextPage(list) {
  return (dispatch, getState) => {
    // Make sure there is a next page
    let { 
      videoPreviewLists: { 
        _private: {
          [list]: { modelRoot, getFalcorQuery, idx } 
        },
        [list]: { nextPageDisabled }
      }
    } = getState();
    
    if (nextPageDisabled) return;
    
    let nextPageIdx = idx + 4;
    return dispatch(fetchPageOfVideos(list, modelRoot, nextPageIdx, getFalcorQuery));
  };
};

export function previousPage(list) {
  return (dispatch, getState) => {
    // Make sure we're not trying to go back too far
    let { 
      videoPreviewLists: { 
        _private: {
          [list]: { modelRoot, getFalcorQuery, idx } 
        },
        [list]: { previousPageDisabled } 
      }
    } = getState();
    
    if (previousPageDisabled) return;
    
    let prevPageIdx = idx - 4;
    return dispatch(fetchPageOfVideos(list, modelRoot, prevPageIdx, getFalcorQuery));
  };
};

// Fetch a page of videos async action
function fetchPageOfVideos(list, modelRoot, idx, getFalcorQuery) {
  return dispatch => {
    // Let the UI know we're loading
    let query = getFalcorQuery(modelRoot, idx);
    dispatch(videoPreviewListRequest(list, query));
    
    // Query will be an array of queries to run, so destructure to pass as arguments
    return model.get(...query).then(response => {
      // Give UI the results
      dispatch(videoPreviewListReceive(list, idx, values(response.json[modelRoot]), getFalcorQuery));
    });
  }
}