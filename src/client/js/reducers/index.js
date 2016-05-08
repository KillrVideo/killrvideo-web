import { combineReducers } from 'redux';
import { reducer as form } from 'redux-form';
import { routeReducer as routing } from 'react-router-redux';
import * as ActionTypes from 'actions';

// Reducers in other files
import home from './home';
import viewVideo from './view-video';
import authentication from './authentication';
import search from './search';
import accountInfo from './account-info';
import addVideo from './add-video';
import uploadStatus from './upload-status';
import chat from './chat';
import config from './config';

// Handle what is this UI state
function whatIsThis(state = { visible: false }, action) {
  if (action.type === ActionTypes.TOGGLE_WHAT_IS_THIS) {
    return { visible: !state.visible };
  }
  
  return state;
}

const rootReducer = combineReducers({
  routing,
  form,
  whatIsThis,
  authentication,
  search,
  home,
  viewVideo,
  accountInfo,
  addVideo,
  uploadStatus,
  chat,
  config
});

export default rootReducer;