import { ActionTypes } from 'actions/add-video';
import { combineReducers } from 'redux';
import { isUndefined } from 'lodash';
import VideoLocationTypes from 'lib/video-location-types';

import youTube from './add-youtube-video';
import upload from './add-uploaded-video';

// The default video source when adding a video
const defaultSource = VideoLocationTypes.UPLOAD;

// Reducer for the currently selected source
function videoLocationType(state = defaultSource, action) {
  switch(action.type) {
    case ActionTypes.SET_SOURCE:
      return action.payload.videoLocationType
    case ActionTypes.UNLOAD:
      return defaultSource;
  }
  
  return state;
}

// Export reducer
export default combineReducers({
  videoLocationType,
  youTube,
  upload
});