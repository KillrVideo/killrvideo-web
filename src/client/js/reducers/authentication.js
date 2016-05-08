import { ActionTypes } from 'actions/authentication';
import { combineReducers } from 'redux';
import { merge } from 'lodash';

// Default state of the currently authenticated user
const defaultCurrentUserState = {
  isLoggedIn: null,
  info: {}
};

// Reducer for the currently authenticated user
function currentUserReducer(state = defaultCurrentUserState, action) {
  switch (action.type) {
    case ActionTypes.LOGIN.SUCCESS:
    case ActionTypes.REGISTER.SUCCESS:
      return {
        isLoggedIn: true,
        info: action.payload
      };
      
    case ActionTypes.LOGOUT.SUCCESS:
      return {
        isLoggedIn: false,
        info: {}
      };
      
    case ActionTypes.GET_CURRENT_USER.SUCCESS:
      let isLoggedIn = !!action.payload;
      return {
        isLoggedIn,
        info: isLoggedIn ? merge({}, state.info, action.payload) : {}
      };
  }
  return state;
}

// Overall reducer for authentication-related stuff
const auth = combineReducers({
  currentUser: currentUserReducer
});

export default auth;