import * as Actions from 'actions/authentication';
import { combineReducers } from 'redux';

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
  isLoggedIn: false,
  info: null
};

function currentUserReducer(state = defaultCurrentUserState, action) {
  switch (action.type) {
    case Actions.LOGIN_SUCCESS:
      return {
        isLoggedIn: true,
        info: action.payload.currentUser
      };
    case Actions.LOGOUT_SUCCESS:
      return defaultCurrentUserState;
  }
  return state;
}

const auth = combineReducers({
  login: loginReducer,
  currentUser: currentUserReducer
});

export default auth;