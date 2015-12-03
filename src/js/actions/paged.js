import createAction from 'redux-actions/lib/createAction';
import model from 'stores/falcor-model';
import { isUndefined, values } from 'lodash';

/**
 * Paging action constants
 */

export const RESET = 'paged/RESET';
export const REQUEST = 'paged/REQUEST';
export const RECEIVE = 'paged/RECEIVE';
export const CHANGE_PAGE = 'paged/CHANGE_PAGE';

/**
 * Private action creators
 */

const reset = createAction(RESET, listId => ({ listId }));
const request = createAction(REQUEST, listId => ({ listId }));
const receive = createAction(RECEIVE, (listId, data, moreDataOnServer, model) => ({ listId, data, moreDataOnServer, model }));
const changePage = createAction(CHANGE_PAGE, (listId, currentPageIndex) => ({ listId, currentPageIndex }));

/**
 * Public action creators
 */

// Action to get the initial page of records in a list using falcor
export function getInitialPage(pagingConfig, queryRoot, queries) {
  return (dispatch, getState) => {
    // Reset any existing state if necessary
    let { paged: { [pagingConfig.listId]: { _model: currentModel } } } = getState();
    if (currentModel !== null) {
      dispatch(reset(pagingConfig.listId));
    }
        
    // Tell the UI we're loading
    dispatch(request(pagingConfig.listId));
    
    // Add paging range to queries
    queries = queries.map(q => [ { from: 0, length: pagingConfig.recordsPerPage }, ...q ]);
    
    let queryModel = null;
    model.deref(queryRoot, ...queries)
      .subscribe(
        m => { queryModel = m; },
        null, // TODO: Error handler?
        () => {
          // Possible to have null for the query model if no results were found
          if (queryModel === null) {
            dispatch(receive(pagingConfig.listId, [], false, null));
            return;
          }
          
          queryModel.get(...queries).then(response => {
            const data = isUndefined(response) ? [] : values(response.json);
            const moreDataOnServer = data.length === pagingConfig.recordsPerPage;
            dispatch(receive(pagingConfig.listId, data, moreDataOnServer, queryModel));
          });
        }
      );
  };
};

// Go to the next page of records in the list
export function nextPageClick(pagingConfig, queries) {
  return (dispatch, getState) => {
    // Grab some of the current state
    let {
      paged: { 
        [pagingConfig.listId]: { 
          _model: queryModel, 
          moreDataOnServer, 
          data,
          currentPageIndex 
        }
      }
    } = getState();
    
    const nextPageStartIdx = currentPageIndex + pagingConfig.incrementIndexPerPage;
    const alreadyHaveSomeOfNextPage = data.length > nextPageStartIdx;
    
    // If no data on the server and no data on the next page available, just bail and do nothing
    if (moreDataOnServer === false) {
      if (alreadyHaveSomeOfNextPage === false) {
        return;
      }
      
      // No data on server, but some records to show so go to the next page
      return dispatch(changePage(pagingConfig.listId, nextPageStartIdx));
    }
    
    // Do we have the full next page to show without going to the server?
    const nextPageEndIdx = nextPageStartIdx + pagingConfig.recordsPerPage - 1;
    if (nextPageEndIdx < data.length) {
      return dispatch(changePage(pagingConfig.listId, nextPageStartIdx));
    }
    
    // There are more pages available on the server and we need them, so go get them then go to the next page
    dispatch(request(pagingConfig.listId));
    
    queries = queries.map(q => [ { from: data.length, length: pagingConfig.recordsPerRequest }, ...q ]);
    queryModel.get(...queries).then(response => {
      const newData = isUndefined(response) ? [] : values(response.json);
      const moreDataAvailable = newData.length === pagingConfig.recordsPerRequest;
      dispatch(receive(pagingConfig.listId, newData, moreDataAvailable));
      
      // If we got an empty page of data, make sure we actually have data on the next page to show
      if (newData.length === 0 && alreadyHaveSomeOfNextPage === false) {
        return;
      }
      
      return dispatch(changePage(pagingConfig.listId, nextPageStartIdx));
    });
  };
};

// Go to the previous page of records in the list
export function previousPageClick(pagingConfig) {
  return (dispatch, getState) => {
    let { paged: { [pagingConfig.listId]: { currentPageIndex } } } = getState();
    if (currentPageIndex === 0) return;
    
    return dispatch(changePage(pagingConfig.listId, currentPageIndex - pagingConfig.incrementIndexPerPage));
  };
};
