import * as Actions from 'actions/authentication';
import { combineReducers } from 'redux';
import { merge } from 'lodash';

const defaultLoginState = {
  isLoading: false,
  errors: []
};

function loginReducer(state = defaultLoginState, action) {
  switch(action.type) {
    case Actions.LOGIN_RESET:
      return defaultLoginState;
    case Actions.LOGIN_REQUEST:
      let { isLoading, ...restOfState } = state;
      return {
        isLoading: true,
        ...restOfState
      };
    case Actions.LOGIN_FAILURE:
      return {
        isLoading: false,
        errors: action.payload.errors
      };
    case Actions.LOGIN_SUCCESS:
      return defaultLoginState;
  }
  
  return state;
}

const defaultCurrentUserState = {
  isFromServer: false,
  isLoggedIn: false,
  info: null
};

function currentUserReducer(state = defaultCurrentUserState, action) {
  switch (action.type) {
    case Actions.LOGIN_SUCCESS:
      return {
        isFromServer: true,
        isLoggedIn: true,
        info: action.payload.currentUser
      };
    case Actions.LOGOUT_SUCCESS:
      return {
        isFromServer: true,
        isLoggedIn: false,
        info: null
      };
    case Actions.RECEIVE_CURRENT_USER:
      return {
        isFromServer: true,
        isLoggedIn: action.payload.currentUser !== null,
        info: action.payload.currentUser === null ? null : merge({}, state.info, action.payload.currentUser)
      };
  }
  return state;
}

const auth = combineReducers({
  login: loginReducer,
  currentUser: currentUserReducer
});

export default auth;