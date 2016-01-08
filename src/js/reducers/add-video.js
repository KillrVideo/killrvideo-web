import { ActionTypes } from 'actions/add-video';
import { combineReducers } from 'redux';
import { isUndefined } from 'lodash';
import VideoLocationTypes from 'lib/video-location-types';

import youTube from './add-youtube-video';
import upload from './add-uploaded-video';

// The default video source when adding a video
const defaultSource = VideoLocationTypes.UPLOAD;

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

function dispatchToSource(source, state, action) {
  switch (source) {
    case VideoLocationTypes.YOUTUBE:
      return youTube(state, action);
    case VideoLocationTypes.UPLOAD:
      return upload(state, action);
  }
}

function sourceSpecific(state, action) {
  // Figure out the currently selected source
  const currentSource = isUndefined(state) ? defaultSource : state.videoLocationType;
  
  // Dispatch action to the current source
  state = dispatchToSource(currentSource, state, action);
  
  // If we're switching sources, dispatch to the new source as well
  if (action.type === ActionTypes.SET_SOURCE) {
    state = dispatchToSource(action.payload.videoLocationType, state, action);
  }
  
  return state;
}

// Export reducer
export default combineReducers({
  common,
  sourceSpecific
});