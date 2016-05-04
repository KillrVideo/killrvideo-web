import { ActionTypes } from 'actions/authentication';
import { combineReducers } from 'redux';
import { merge } from 'lodash';

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
  currentUser: currentUserReducer
});

export default auth;