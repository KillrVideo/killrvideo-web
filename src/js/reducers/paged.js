import { _, isUndefined } from 'lodash';
import * as Actions from 'actions/paged';

const defaultPagedState = {
  _model: null,
  
  moreDataOnServer: false,
  isLoading: false,
  data: [],
  currentPageIndex: 0
};

function paged(state = defaultPagedState, action) {
  let _model, moreDataOnServer, isLoading, data, currentPageIndex, restOfState;
  
  switch (action.type) {
    case Actions.RESET:
      return defaultPagedState;
    
    case Actions.REQUEST:
      ({ isLoading, ...restOfState } = state);
      return {
        isLoading: true,
        ...restOfState
      };
      
    case Actions.RECEIVE:
      ({ _model, moreDataOnServer, isLoading, data, ...restOfState } = state);
      return {
        _model: isUndefined(action.payload.model) ? _model : action.payload.model,
        moreDataOnServer: action.payload.moreDataOnServer,
        isLoading: false,
        data: [ ...data, ...action.payload.data ],
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

function allPaged(state = {}, action) {
  switch (action.type) {
    case Actions.RESET:
    case Actions.REQUEST:
    case Actions.RECEIVE:
    case Actions.CHANGE_PAGE:
      let { [action.payload.listId]: listState, ...restOfState } = state;
      return {
        [action.payload.listId]: paged(listState, action),
        ...restOfState
      };
  }
  
  return state;
}

export default allPaged;