import { combineReducers } from 'redux';
import { ActionTypes } from 'actions/chat';
import { createPagedReducer } from './paged';
import { sortBy } from 'lodash';

// Default state for users in the chat room
const defaultUsersState = {
  isLoading: false,
  data: []
};

// Reducer for users in the chat room
function users(state = defaultUsersState, action) {
  switch (action.type) {
    case ActionTypes.JOIN_ROOM.LOADING:
      return {
        ...state,
        isLoading: true
      };
      
    case ActionTypes.JOIN_ROOM.SUCCESS:
      return {
        ...state,
        isLoading: false,
        data: sortBy(action.payload, [ 'firstName', 'lastName' ])
      };
      
    case ActionTypes.JOIN_ROOM.FAILURE:
      return defaultUsersState;
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
  sending: false,
  data: []
};

// Reducer for new messages
function messages(state = defaultMessagesState, action) {
  switch (action.type) {
    case ActionTypes.JOIN_ROOM.LOADING:
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
      
    case ActionTypes.NOTIFICATION_RECEIVED:
      return state;   // TODO: Handle notificiations
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