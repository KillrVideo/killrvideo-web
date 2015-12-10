import { isUndefined } from 'lodash';
import * as Actions from 'actions/paged';

function paged(defaultState, state, action) {
  // Add default state if necessary
  if (isUndefined(state) || isUndefined(state.data)) {
    state = { ...state, ...defaultState };
  }
  
  // Ignore actions that aren't for this paged list
  if (isUndefined(action.payload) || action.payload.listId !== state._listId) {
    return state;
  }
  
  switch (action.payload.pagedType) {
    case Actions.RESET:
      return {
        ...state,
        ...defaultState
      };
      
    case Actions.REQUEST:
      return {
        ...state,
        isLoading: true
      };
      
    case Actions.RECEIVE:
      let queryModel = isUndefined(action.payload.queryModel) ? state._queryModel : action.payload.queryModel;
      
      return {
        ...state,
        _queryModel: queryModel,
        isLoading: false,
        data: [ ...state.data, ...action.payload.data ],
        moreDataOnServer: action.payload.moreDataOnServer
      };
      
    case Actions.CHANGE_PAGE:
      return {
        ...state,
        currentPageIndex: action.payload.currentPageIndex
      };
    
  }
  
  return state;
}

const defaultPagedState = {
  _queryModel: null,
  
  isLoading: false,
  data: [],
  moreDataOnServer: true,
  currentPageIndex: 0
};

/**
 * Returns a function that will act as a reducer for paged state of the given list Id
 */
export function createPagedReducer(listId, pagingConfig) {
  pagingConfig = { ...pagingConfig };
  
  // Validate/normalize the paging config
  if (isUndefined(pagingConfig.recordsPerPage))
    throw new Error('You must specify recordsPerPage property on paging config.');
  
  if (isUndefined(pagingConfig.recordsPerRequest))
    pagingConfig.recordsPerRequest = pagingConfig.recordsPerPage;
  
  if (isUndefined(pagingConfig.incrementIndexPerPage))
    pagingConfig.incrementIndexPerPage = pagingConfig.recordsPerPage;
    
  const defaultState = {
    _listId: listId,
    pagingConfig,
    ...defaultPagedState
  };
    
  return function pagedReducer(state, action) {
    return paged(defaultState, state, action);
  };
};