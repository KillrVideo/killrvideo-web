import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { routerStateReducer } from 'redux-router';
import * as ActionTypes from 'actions';

// Reducers in other files
import videoPreviews from './video-previews';
import viewVideo from './view-video';
import auth from './authentication';

// Handle what is this UI state
function whatIsThis(state = { visible: false }, action) {
  if (action.type === ActionTypes.TOGGLE_WHAT_IS_THIS) {
    return { visible: !state.visible };
  }
  
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
  authentication: auth,
  search: search,
  videoPreviews: videoPreviews,
  viewVideo: viewVideo
});

export default rootReducer;