import { ActionTypes } from 'actions/add-video';
import { combineReducers } from 'redux';
import { isUndefined } from 'lodash';
import VideoLocationTypes from 'lib/video-location-types';

import youTube from './add-youtube-video';
import upload from './add-uploaded-video';

// The default video source when adding a video
const defaultSource = VideoLocationTypes.YOUTUBE;

// Default common state for all add video sources
const commonDefaultState = {
  videoId: null,
  showCommonDetails: false
};

// Reducer for common add video state
function common(state = commonDefaultState, action) {
  switch(action.type) {
    case ActionTypes.SET_SOURCE:
      return commonDefaultState;
      
    case ActionTypes.SET_COMMON_DETAILS_VISIBILITY:
      return {
        ...state,
        showCommonDetails: action.payload.showCommonDetails
      };
    
    case ActionTypes.ADD_SUCCESSFUL:
      return {
        ...state,
        videoId: action.payload.addedVideoId
      };
  }
  
  return state;
}

function sourceSpecific(state, action) {
  // Figure out which reducer to dispatch to the action to
  const source = action.type === ActionTypes.SET_SOURCE
    ? action.payload.videoLocationType  // Changing sources so dispatch to new source that is being set
    : isUndefined(state)
      ? defaultSource   // We have no state yet, so use the default
      : state.videoLocationType;  // We've got state, so use whatever source is currently selected
  
  // Dispatch actions based on the appropriate source
  switch (source) {
    case VideoLocationTypes.YOUTUBE:
      return youTube(state, action);
    case VideoLocationTypes.UPLOAD:
      return upload(state, action);
  }
  
  return state;
}

// Export reducer
export default combineReducers({
  common,
  sourceSpecific
});