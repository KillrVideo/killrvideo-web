import { ActionTypes } from 'actions/authentication';
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
    case ActionTypes.LOGIN_RESET:
    case ActionTypes.LOGIN.SUCCESS:
      return defaultLoginState;
      
    case ActionTypes.LOGIN.LOADING:
      let { isLoading, ...restOfState } = state;
      return {
        isLoading: true,
        ...restOfState
      };
      
    case ActionTypes.LOGIN.FAILURE:
      return {
        isLoading: false,
        errors: action.payload
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
    case ActionTypes.REGISTER_RESET:
      return defaultRegisterState;
      
    case ActionTypes.REGISTER.LOADING:
      let { isLoading, ...restOfState } = state;
      return {
        isLoading: true,
        ...restOfState
      };
      
    case ActionTypes.REGISTER.SUCCESS:
      return {
        isLoading: false,
        wasSuccessful: true,
        errors: []
      };
      
    case ActionTypes.REGISTER.FAILURE:
      return {
        isLoading: false,
        wasSuccessful: false,
        errors: action.payload
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
    case ActionTypes.LOGIN.SUCCESS:
    case ActionTypes.REGISTER.SUCCESS:
      return {
        isFromServer: true,
        isLoggedIn: true,
        info: action.payload
      };
      
    case ActionTypes.LOGOUT.SUCCESS:
      return {
        isFromServer: true,
        isLoggedIn: false,
        info: null
      };
      
    case ActionTypes.GET_CURRENT_USER.SUCCESS:
      return {
        isFromServer: true,
        isLoggedIn: !!action.payload,
        info: !!action.payload ? merge({}, state.info, action.payload) : null
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