import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { routerStateReducer } from 'redux-router';
import * as ActionTypes from 'actions';

// Reducers in other files
import videoPreviews from './video-previews';
import viewVideo from './view-video';
import auth from './authentication';
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
  router: routerStateReducer,
  form: formReducer,
  whatIsThis: whatIsThis,
  authentication: auth,
  search: search,
  videoPreviews: videoPreviews,
  viewVideo: viewVideo,
  accountInfo: accountInfo
});

export default rootReducer;