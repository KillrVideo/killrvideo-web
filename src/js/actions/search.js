import createAction from 'redux-actions/lib/createAction';
import model from 'stores/falcor-model';
import { isUndefined, values } from 'lodash';

/**
 * Number of search results to show per page.
 */
export const RESULTS_PER_PAGE = 8;

// The number of previews to fetch when going to the server after the initial page
const PREVIEWS_TO_FETCH = 20;

/**
 * Action constants
 */
export const REQUEST_RESULTS = 'search/REQUEST_RESULTS';
export const RECEIVE_RESULTS = 'search/RECEIVE_RESULTS';
export const NEXT_PAGE = 'search/NEXT_PAGE';
export const PREVIOUS_PAGE = 'search/PREVIOUS_PAGE';
export const RESET_RESULTS = 'search/RESET_RESULTS';

/**
 * Private action creators
 */

const resetResults = createAction(RESET_RESULTS);
const requestResults = createAction(REQUEST_RESULTS);
const receiveResults = createAction(RECEIVE_RESULTS, (previews, morePreviewsAvailable, previewsModel) => ({ previews, morePreviewsAvailable, previewsModel }));
const nextPage = createAction(NEXT_PAGE);
const previousPage = createAction(PREVIOUS_PAGE);

/**
 * Public action creators
 */

// Get initial seach results for a term
export function searchFor(term, previewsQueries) {
  return dispatch => {
    // Reset any state currently in the search results
    dispatch(resetResults());
    
    // Tell UI we're loading
    dispatch(requestResults());
    
    // Add paging info to queries
    const queries = previewsQueries.map(q => [ { from: 0, length: RESULTS_PER_PAGE }, ...q ]);
    
    // Deref to get a stable view for paging
    let previewsModel = null;
    return model.deref([ 'search', `query=${term}` ], ...queries)
      .subscribe(
        m => { previewsModel = m; },
        null, // TODO: Error handler?
        () => {
          // Once complete, do a get if we have a model
          if (previewsModel === null) {
            dispatch(receiveResults([], false, null));
            return;
          }
          
          previewsModel.get(...queries).then(response => {
            const previews = isUndefined(response) ? [] : values(response.json);
            const morePreviewsAvailable = previews.length !== 0;
            dispatch(receiveResults(previews, morePreviewsAvailable, previewsModel));
          });
        });
  };
};

// Go to the next page in the search results, possibly fetching more results from the server first
export function nextPageClick(previewsQueries) {
  return (dispatch, getState) => {
    // Grab some of the current state
    let {
      search: { 
        results: { _previewsModel: previewsModel, _morePreviewsAvailable: morePreviewsAvailable, previews, currentPageIndex }
      }
    } = getState();
    
    // Are there more previews available on the server?
    const nextPageStartIdx = currentPageIndex + RESULTS_PER_PAGE;
    const alreadyHaveSomeOfNextPage = previews.length > nextPageStartIdx;
    if (morePreviewsAvailable === false) {
      // If we already have some/all of the next page, just go to the next page
      return alreadyHaveSomeOfNextPage ? dispatch(nextPage()) : undefined;
    }
    
    // Do we have the full next page to show without going to the server?   
    const nextPageEndIdx = nextPageStartIdx + RESULTS_PER_PAGE - 1;
    if (nextPageEndIdx < previews.length) {
      return dispatch(nextPage());
    }
    
    // There are more pages available on the server and we need them, so go get them then go to the next page
    dispatch(requestResults());
    
    const queries = previewsQueries.map(q => [ { from: previews.length, length: PREVIEWS_TO_FETCH }, ...q ]);
    return previewsModel.get(...queries).then(response => {
      // Dispatch any previews we received
      const newPreviews = isUndefined(response) ? [] : values(response.json);
      const morePreviewsAvailable = newPreviews.length !== 0;
      dispatch(receiveResults(newPreviews, morePreviewsAvailable));
      
      // If we got an empty page of previews, make sure we actually have records on the next page to show
      if (newPreviews.length === 0 && alreadyHaveSomeOfNextPage === false) {
        return;
      }
      
      dispatch(nextPage());
    });
  };
};

// Go to the previous page of search results
export function previousPageClick() {
  return (dispatch, getState) => {
    // Make sure we're not on the first page
    let {
      search: { 
        results: { currentPageIndex }
      }
    } = getState();
    
    return currentPageIndex === 0 ? undefined : dispatch(previousPage());
  };
};

// Just reset search results state when unloaded
export const unload = resetResults;