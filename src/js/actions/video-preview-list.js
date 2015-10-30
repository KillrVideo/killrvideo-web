import createAction from 'redux-actions/lib/createAction';
import model from 'stores/falcor-model';
import { _ } from 'lodash';

// List definitions
export const AvailableLists = {
  recentVideos: {
    videoQueryRoot: [ 'recentVideos' ],
    responseSelector: response => response.json.recentVideos
  }
}


/**
 * Public action constants
 */
export const LOAD = 'videoPreviewList/LOAD';
export const UNLOAD = 'videoPreviewList/UNLOAD';
export const REQUEST_PREVIEWS = 'videoPreviewList/REQUEST_PREVIEWS';
export const RECEIVE_PREVIEWS = 'videoPreviewList/RECEIVE_PREVIEWS';

/**
 * Private action creators
 */
const _load = createAction(LOAD, (list, videoQueries) => ({ list, videoQueries }));
const requestPreviews = createAction(REQUEST_PREVIEWS, (list, videoQueries) => ({ list, videoQueries }));
const receivePreviews = createAction(RECEIVE_PREVIEWS, (list, videos, startIndex) => ({ list, videos, startIndex }));
function fetchVideos(list, startIndex) {
  return (dispatch, getState) => {
    // Get the queries from private state
    let { 
      videoPreviewLists: { 
        _private: { 
          [list]: { videoQueries }
        } 
      } 
    } = getState();
    
    // Get the query root and the response selector from the list definition constant above
    let { [list]: { videoQueryRoot, responseSelector } } = AvailableLists;
    
    // Add query root and range information to each query and then let the UI know we're querying
    let queries = videoQueries.map(q => [ ...videoQueryRoot, { from: startIndex, length: 5 }, ...q ]);
    dispatch(requestPreviews(list, queries));
    
    // Execute the queries and dispatch the response when complete
    return model.get(...queries).then(response => {
      const nonNullVideos = _(responseSelector(response)).values().takeWhile(v => v !== null).value();
      dispatch(receivePreviews(list, nonNullVideos, startIndex))
    });
  };
}

/**
 * Public action creators
 */
export const unload = createAction(UNLOAD, list => ({ list }));
export function load(list, videoQueries) {
  return (dispatch, getState) => {
    // Tell everyone we're loading
    dispatch(_load(list, videoQueries));
    
    // Fetch the initial page of records
    return dispatch(fetchVideos(list, 0));
  }
};

export function nextPageClick(list) {
  return (dispatch, getState) => {
    // See if we're allowed to go to the next page and also pull the current start index
    let { 
      videoPreviewLists: {
        [list]: {
          nextPageDisabled
        },
        _private: {
          [list]: { 
            startIndex
          }
        }
      }
    } = getState();
    
    if (nextPageDisabled) return;
    
    return dispatch(fetchVideos(list, startIndex + 4));
  };
};

export function previousPageClick(list) {
  return (dispatch, getState) => {
    // See if we're allowed to go to the previous page and also pull the current start index
    let { 
      videoPreviewLists: {
        [list]: {
          previousPageDisabled
        },
        _private: {
          [list]: { 
            startIndex
          }
        }
      }
    } = getState();
    
    if (previousPageDisabled) return;
    
    return dispatch(fetchVideos(list, startIndex - 4));
  };
};

