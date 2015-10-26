import * as ActionTypes from 'actions/video-preview-list';
import { mapValues } from 'lodash';

const defaultPrivateState = {
  startIndex: 0
};

// Reducer for the private state of an individual list
function videoPreviewListPrivate(state = defaultPrivateState, action) {
  switch(action.type) {
    case ActionTypes.LOAD:
      return {
        videoQueries: action.payload.videoQueries,
        ...state
      };
    case ActionTypes.RECEIVE_PREVIEWS:
      let { startIndex, ...restOfState } = state;
      return {
        startIndex: action.payload.startIndex,
        ...restOfState
      };
    case ActionTypes.UNLOAD:
      return defaultPrivateState;
  }
  
  return state;
}

const defaultPublicState = { 
  isLoading: false, 
  videos: [],
  nextPageDisabled: true,
  previousPageDisabled: true
};

// Reducer for the public state of an individual list
function videoPreviewList(state = defaultPublicState, action) {
  switch(action.type) {
    case ActionTypes.REQUEST_PREVIEWS:
      let { isLoading, nextPageDisabled, previousPageDisabled, ...restOfState } = state;
      return {
        isLoading: true,
        nextPageDisabled: true,
        previousPageDisabled: true,
        ...restOfState
      };
    case ActionTypes.RECEIVE_PREVIEWS:
      return {
        videos: action.payload.videos,
        isLoading: false,
        nextPageDisabled: action.payload.videos.length < 5,
        previousPageDisabled: action.payload.startIndex === 0
      };
    case ActionTypes.UNLOAD:
      return defaultPublicState;
  }
  
  return state;
}

const defaultListsState = {
  // Private state for each list
  _private: { },
  // Populate some initial state for all available lists
  ...mapValues(ActionTypes.AvailableLists, () => defaultPublicState)
};

function videoPreviewLists(state = defaultListsState, action) {
  switch(action.type) {
    case ActionTypes.REQUEST_PREVIEWS:
    case ActionTypes.RECEIVE_PREVIEWS:
    case ActionTypes.LOAD:
    case ActionTypes.UNLOAD:
      let {
        [action.payload.list]: publicState,
        _private: {
          [action.payload.list]: privateState,
          ...restOfPrivateState
        },
        ...restOfPublicState
      } = state;
      
      return {
        _private: {
          [action.payload.list]: videoPreviewListPrivate(privateState, action),
          ...restOfPrivateState
        },
        [action.payload.list]: videoPreviewList(publicState, action),
        ...restOfPublicState
      };
  }
  
  return state;
}

export default videoPreviewLists;