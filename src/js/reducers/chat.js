import { combineReducers } from 'redux';
import { ActionTypes } from 'actions/chat';
import { createPagedReducer } from './paged';
import { uniqBy, sortBy, findIndex, pullAt } from 'lodash';

// Default state for users in the chat room
const defaultUsersState = {
  isLoading: false,
  data: []
};

// Reducer for users in the chat room
function users(state = defaultUsersState, action) {
  let newData, idx;
  switch (action.type) {
    case ActionTypes.JOIN_ROOM.LOADING:
      return {
        ...state,
        isLoading: true
      };
      
    case ActionTypes.JOIN_ROOM.SUCCESS:
      newData = sortBy(uniqBy([ ...state.data, ...action.payload.users ], 'userId'), [ 'firstName', 'lastName' ]);
      return {
        ...state,
        isLoading: false,
        data: newData
      };
    
    case ActionTypes.LEAVE_ROOM:  
    case ActionTypes.JOIN_ROOM.FAILURE:
      return defaultUsersState;
    
    case ActionTypes.USER_JOINED.SUCCESS:
      idx = findIndex(state.data, { userId: action.payload.userId });
      if (idx === -1) {
        newData = sortBy([ ...state.data, action.payload ], [ 'firstName', 'lastName' ]);
        return {
          ...state,
          data: newData
        };
      }
      
      
    case ActionTypes.USER_LEFT.SUCCESS:
      idx = findIndex(state.data, { userId: action.payload.userId });
      if (idx !== -1) {
        newData = [ ...state.data ];
        pullAt(newData, idx);
        return {
          ...state,
          data: newData
        };
      }
  }
  
  return state;
}

// Reducer for message history
const messageHistoryListId = 'chatMessageHistory';
const messageHistoryPagingConfig = {
  recordsPerPage: 20
};
const messageHistory = createPagedReducer(messageHistoryListId, messageHistoryPagingConfig);

// Default state for new messages
const defaultMessagesState = {
  _promise: null,
  _socket: null,
  
  sending: false,
  data: []
};

// Reducer for new messages
function messages(state = defaultMessagesState, action) {
  switch (action.type) {
    case ActionTypes.JOIN_ROOM.LOADING:
      return {
        ...state,
        _promise: action.payload.promise
      };
      
    case ActionTypes.JOIN_ROOM.SUCCESS:
      return {
        ...state,
        _promise: null,
        _socket: action.payload.socket
      };
      
    case ActionTypes.JOIN_ROOM.FAILURE:
    case ActionTypes.LEAVE_ROOM:
      return defaultMessagesState;
      
    case ActionTypes.SEND_MESSAGE.LOADING:
      return {
        ...state,
        sending: true
      };
      
    case ActionTypes.SEND_MESSAGE.SUCCESS:
    case ActionTypes.SEND_MESSAGE.FAILURE:
      // TODO: Handle message send failures
      return {
        ...state,
        sending: false
      };
  }
  
  return state;
}

// Create root reducer for chat and export
const chat = combineReducers({
  users,
  messageHistory,
  messages
});

export default chat; 