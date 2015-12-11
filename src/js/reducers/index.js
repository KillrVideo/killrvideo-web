import { combineReducers } from 'redux';
import { reducer as form } from 'redux-form';
import { routerStateReducer as router } from 'redux-router';
import * as ActionTypes from 'actions';

// Reducers in other files
import home from './home';
import viewVideo from './view-video';
import authentication from './authentication';
import search from './search';
import accountInfo from './account-info';

// Handle what is this UI state
function whatIsThis(state = { visible: false }, action) {
  if (action.type === ActionTypes.TOGGLE_WHAT_IS_THIS) {
    return { visible: !state.visible };
  }
  
  return state;
}

const rootReducer = combineReducers({
  router,
  form,
  whatIsThis,
  authentication,
  search,
  home,
  viewVideo,
  accountInfo
});

export default rootReducer;