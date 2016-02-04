import { createAction } from 'redux-actions';
import { createActionTypeConstants } from './promises';
import { createPagedActions } from './paged';
import model from 'stores/falcor-model';
import { isUndefined, values } from 'lodash';

/**
 * Action Type Constants
 */

const JOIN_ROOM = 'chat/JOIN_ROOM';
const GET_MESSAGES = 'chat/GET_MESSAGES';
const SEND_MESSAGE = 'chat/SEND_MESSAGE';

export const ActionTypes = {
  JOIN_ROOM: createActionTypeConstants(JOIN_ROOM),
  GET_MESSAGES: createActionTypeConstants(GET_MESSAGES),
  SEND_MESSAGE: createActionTypeConstants(SEND_MESSAGE),
  NOTIFICATION_RECEIVED: 'chat/NOTIFICATION_RECEIVED',
  LEAVE_ROOM: 'chat/LEAVE_ROOM'
};

/**
 * Actions
 */

const messageHistoryActions = createPagedActions(state => state.chat.messageHistory);

export const joinRoom = createAction(JOIN_ROOM, (roomName, messageQueries, userQueries) => {
  // Paths to get on the chat room
  const thisPaths = [
    [ 'users', 'length' ]
  ];
  
  const chatRoomPath = [ 'chatRooms', roomName ];
  
  const promise = model.call([ ...chatRoomPath, 'join' ], [], [], thisPaths).then(response => {
    // TODO: Open socket for notifications
    
    // Get initial message history
    messageHistoryActions.getInitialPage([ ...chatRoomPath, 'messages' ], messageQueries);
    
    // Get all users in the chat room
    const userRange = { length: response.json.chatRooms[roomName].users.length };
    userQueries = userQueries.map(q => [ ...chatRoomPath, 'users', userRange, ...q ]);
    return model.get(...userQueries).then(userResponse => {
      return isUndefined(userResponse) ? [] : values(response.json);
    });
  });
  
  return {
    promise,
    data: { promise }
  };
});

export function getMessages(messageQueries) {
  return messageHistoryActions.nextPageClick(messageQueries);
};

export const sendMessage = createAction(ActionTypes.SEND_MESSAGE, (roomName, message) => {
  const promise = model.call([ 'chatRooms', roomName, 'sendMessage' ], [ message ]).then(response => response);
  
  return {
    promise,
    data: { promise }
  };
});

export const leaveRoom = createAction(ActionTypes.LEAVE_ROOM, roomName => {
  messageHistoryActions.unload();
  model.call([ 'chatRooms', roomName, 'leave' ], []).then(response => response);
});