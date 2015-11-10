import * as Actions from 'actions/authentication';
import { combineReducers } from 'redux';
import { merge } from 'lodash';

// Default state for the login screen
const defaultLoginState = {
  isLoading: false,
  errors: []
};

// Reducer for the login screen
function loginReducer(state = defaultLoginState, action) {
  switch(action.type) {
    case Actions.LOGIN_RESET:
    case Actions.LOGIN_SUCCESS:
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
  }
  
  return state;
}

// Default state for the user registration screen
const defaultRegisterState = {
  isLoading: false,
  wasSuccessful: false,
  errors: []
};

// Reducer for the register screen
function registerReducer(state = defaultRegisterState, action) {
  switch(action.type) {
    case Actions.REGISTER_RESET:
      return defaultRegisterState;
      
    case Actions.REGISTER_REQUEST:
      let { isLoading, ...restOfState } = state;
      return {
        isLoading: true,
        ...restOfState
      };
      
    case Actions.REGISTER_SUCCESS:
      return {
        isLoading: false,
        wasSuccessful: true,
        errors: []
      };
      
    case Actions.REGISTER_FAILURE:
      return {
        isLoading: false,
        wasSuccessful: false,
        errors: action.payload.errors
      };
  }
  
  return state;
}

// Default state of the currently authenticated user
const defaultCurrentUserState = {
  isFromServer: false,
  isLoggedIn: false,
  info: null
};

// Reducer for the currently authenticated user
function currentUserReducer(state = defaultCurrentUserState, action) {
  switch (action.type) {
    case Actions.LOGIN_SUCCESS:
    case Actions.REGISTER_SUCCESS:
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

// Overall reducer for authentication-related stuff
const auth = combineReducers({
  login: loginReducer,
  register: registerReducer,
  currentUser: currentUserReducer
});

export default auth;