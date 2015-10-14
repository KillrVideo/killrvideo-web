import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { routerStateReducer } from 'redux-router';
import * as ActionTypes from 'actions';
import { merge } from 'lodash';

// Handle what is this UI state
function whatIsThis(state = { visible: false }, action) {
  if (action.type === ActionTypes.TOGGLE_WHAT_IS_THIS) {
    return { visible: !state.visible };
  }
  
  return state;
}

// Login state
const defaultLoginState = {
  loggedInUser: null
};
function loginState(state = defaultLoginState, action) {
  return state;
}

// Search
function search(state = { suggestions: [] }, action) {
  switch(action.type) {
    case ActionTypes.SEARCH_BOX_CHANGE:
      // TODO: async query suggestions fetch
      if (action.payload === 'asdf')
        return { suggestions: [ 'Suggestions are working' ] };
      return { suggestions: [] };
    case ActionTypes.SEARCH_BOX_SUBMIT:
      return state;
    default:
      return state;
  }
}

const rootReducer = combineReducers({
  router: routerStateReducer,
  form: formReducer,
  whatIsThis: whatIsThis,
  loginState: loginState,
  search: search
});

export default rootReducer;