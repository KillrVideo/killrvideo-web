import { _, isUndefined } from 'lodash';
import * as Actions from 'actions/paged';

const defaultPagedState = {
  _queryModel: null,
  
  isLoading: false,
  data: [],
  moreDataOnServer: true,
  currentPageIndex: 0
};

function paged(listId, pagingConfig, state, action) {
  if (isUndefined(state)) {
    state = { ...defaultPagedState, pagingConfig };
  }
  
  if (isUndefined(state.data)) {
    state = { ...state, ...defaultPagedState, pagingConfig };
  }
  
  if (isUndefined(action) || isUndefined(action.payload) || action.payload.listId !== listId) {
    return state;
  }
  
  let queryModel, isLoading, data, moreDataOnServer, currentPageIndex, restOfState;
  switch (action.payload.pagedType) {
    case Actions.RESET:
      ({ queryModel, isLoading, data, moreDataOnServer, currentPageIndex, ...restOfState } = state);
      return {
        ...restOfState,
        ...defaultPagedState
      };
      
    case Actions.REQUEST:
      ({ isLoading, ...restOfState } = state);
      return {
        isLoading: true,
        ...restOfState
      };
      
    case Actions.RECEIVE:
      ({ _queryModel: queryModel, isLoading, data, moreDataOnServer, ...restOfState } = state);
      
      queryModel = isUndefined(action.payload.queryModel) ? queryModel : action.payload.queryModel;
      
      return {
        _queryModel: queryModel,
        isLoading: false,
        data: [ ...data, ...action.payload.data ],
        moreDataOnServer: action.payload.moreDataOnServer,
        ...restOfState
      };
      
    case Actions.CHANGE_PAGE:
      ({ currentPageIndex, ...restOfState } = state);
      return {
        currentPageIndex: action.payload.currentPageIndex,
        ...restOfState
      };
    
  }
  
  return state;
}

/**
 * Returns a function that will act as a reducer for paged state of the given list Id
 */
export function createPagedReducer(listId, pagingConfig) {
  // Validate/normalize the paging config
  if (isUndefined(pagingConfig.recordsPerPage))
    throw new Error('You must specify recordsPerPage property on paging config.');
  
  if (isUndefined(pagingConfig.recordsPerRequest))
    pagingConfig.recordsPerRequest = pagingConfig.recordsPerPage;
  
  if (isUndefined(pagingConfig.incrementIndexPerPage))
    pagingConfig.incrementIndexPerPage = pagingConfig.recordsPerPage;
    
  return function pagedReducer(state, action) {
    return paged(listId, pagingConfig, state, action);
  };
};