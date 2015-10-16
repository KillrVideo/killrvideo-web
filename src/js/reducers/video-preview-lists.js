import * as ActionTypes from 'actions/video-preview-list';

const defaultListState = { 
  isLoading: false, 
  videos: [],
  nextPageDisabled: true,
  previousPageDisabled: true
};

// Reducer for the private state of an individual list
function videoPreviewListPrivate(state, action) {
  switch(action.type) {
    case ActionTypes.VIDEO_PREVIEW_LIST_RECIEVE:
      return {
        modelRoot: state.modelRoot,
        idx: action.payload.idx,
        getFalcorQuery: action.payload.getFalcorQuery
      };
    default:
      return state;
  }
}

// Reducer for the public state of an individual list
function videoPreviewList(state, action) {
  switch(action.type) {
    case ActionTypes.VIDEO_PREVIEW_LIST_REQUEST:
      let { isLoading, ...restOfState } = state;
      return {
        isLoading: true,
        ...restOfState
      };
    case ActionTypes.VIDEO_PREVIEW_LIST_RECIEVE:
      return {
        videos: action.payload.videos,
        isLoading: false,
        nextPageDisabled: action.payload.videos.length < 5,
        previousPageDisabled: action.payload.idx === 0
      };
    default:
      return state;
  }
}

const defaultState = {
  recentVideos: {
    ...defaultListState
  },
  // Private state for each list
  _private: {
    recentVideos: {
      modelRoot: 'recentVideos'
    }
  }
};

function videoPreviewLists(state = defaultState, action) {
  switch(action.type) {
    case ActionTypes.VIDEO_PREVIEW_LIST_REQUEST:
    case ActionTypes.VIDEO_PREVIEW_LIST_RECIEVE:
      let { 
        [action.payload.list]: publicListState,
        _private: {
          [action.payload.list]: privateListState,
          ...restOfPrivateState
        },
        ...restOfPublicState 
      } = state;
      
      return {
        [action.payload.list]: videoPreviewList(publicListState, action),
        _private: {
          [action.payload.list]: videoPreviewListPrivate(privateListState, action),
          ...restOfPrivateState
        },
        ...restOfPublicState
      };
    default:
      return state;
  }
}

export default videoPreviewLists;