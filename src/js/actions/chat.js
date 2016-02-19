import { createAction } from 'redux-actions';
import { createActionTypeConstants } from './promises';
import { createPagedActions } from './paged';
import model from 'stores/falcor-model';
import { isUndefined, values } from 'lodash';
import { Promise } from 'lib/promise';
import IO from 'socket.io-client';

/**
 * Action Type Constants
 */

const JOIN_ROOM = 'chat/JOIN_ROOM';
const GET_MESSAGES = 'chat/GET_MESSAGES';
const SEND_MESSAGE = 'chat/SEND_MESSAGE';

// Private action constants for messages coming from the server via the web socket 
const ServerActionTypes = {
  USER_JOINED: 'chat/USER_JOINED',
  USER_LEFT: 'chat/USER_LEFT',
  NEW_MESSAGE: 'chat/NEW_MESSAGE'
};

export const ActionTypes = {
  JOIN_ROOM: createActionTypeConstants(JOIN_ROOM),
  LEAVE_ROOM: 'chat/LEAVE_ROOM',
  GET_MESSAGES: createActionTypeConstants(GET_MESSAGES),
  SEND_MESSAGE: createActionTypeConstants(SEND_MESSAGE),
  USER_JOINED: createActionTypeConstants(ServerActionTypes.USER_JOINED),
  USER_LEFT: createActionTypeConstants(ServerActionTypes.USER_LEFT),
  NEW_MESSAGE: createActionTypeConstants(ServerActionTypes.NEW_MESSAGE)
};

/**
 * Actions
 */

const messageHistoryActions = createPagedActions(state => state.chat.messageHistory);

export function joinRoom(roomName, messageQueries, userQueries) {
  return (dispatch, getState) => {
    // Open socket for notifications
    const socketPromise = new Promise((resolve, reject) => {
      let socket = IO();
      socket.once('connect', () => resolve(socket));
      socket.once('error', reject);
      socket.on('message', msg => {
        const message = JSON.parse(msg);
        let messagePromise = Promise.resolve(message.payload.pathValues)
          .then(pathValues => {
            // Merge any pathValues provided into the falcor model cache
            if (pathValues) {
              return model.withoutDataSource().set(pathValues);
            }
          })
          .return(message)
          .then(m => {
            switch (m.type) {
              case ServerActionTypes.USER_JOINED:
              case ServerActionTypes.USER_LEFT:
                const userId = m.payload.userId;
                const getUserQueries = userQueries.map(q => [ 'usersById', userId, ...q ]);
                return model.get(...getUserQueries)
                  .then(response => response.json.usersById[userId]);
                                
              case ServerActionTypes.NEW_MESSAGE:
                const messageId = m.payload.messageId;
                const getMessageQueries = messageQueries.map(q => [ 'chatRooms', roomName, 'messagesById', messageId, ...q ]);
                return model.get(...getMessageQueries)
                  .then(response => response.json.chatRooms[roomName].messagesById[messageId]);
            }
          });
        
        // Add the promise to the message and dispatch
        message.payload.promise = messagePromise;
        dispatch(message);
      });
    });
    
    // Once socket is connected, send a request to subscribe to notifications (just use the same format as a Redux action)
    socketPromise.then(socket => {
      socket.send(JSON.stringify({ type: 'chat/SUBSCRIBE', payload: { roomName } }));
    });
    
    // Paths to get on the chat room and the falcor path to the chat room
    const thisPaths = [
      [ 'users', 'length' ]
    ];
    const chatRoomPath = [ 'chatRooms', roomName ];
    
    const falcorPromise = model.call([ ...chatRoomPath, 'join' ], [], [], thisPaths).then(response => {
      // Get initial message history
      dispatch(messageHistoryActions.getInitialPage([ ...chatRoomPath, 'messages' ], messageQueries));
      
      // Get all users in the chat room
      const userRange = { length: response.json.chatRooms[roomName].users.length };
      const getAllUsersQueries = userQueries.map(q => [ ...chatRoomPath, 'users', userRange, ...q ]);
      return model.get(...getAllUsersQueries).then(userResponse => {
        return isUndefined(userResponse) ? [] : values(userResponse.json.chatRooms[roomName].users);
      });
    });
    
    // Join is successful only if we open a socket AND get the users list
    const promise = Promise.join(socketPromise, falcorPromise, (socket, users) => {
      return {
        socket,
        users
      };
    }).catch(err => {
      // If the socket was successfully opened, but there was an error, close the socket
      if (socketPromise.isFulfilled()) {
        socketPromise.value().close();
      }
      
      throw err;
    });
    
    // Dispatch join room action
    dispatch({
      type: JOIN_ROOM,
      payload: {
        promise,
        data: { promise }
      }
    });
  };
};

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

export function leaveRoom(roomName) {
  return (dispatch, getState) => {
    // Cancel any existing promise and close the socket
    const { chat: { messages: { _promise: promise, _socket: socket } } } = getState();
    if (promise) {
      promise.cancel();
    }
    
    if (socket) {
      socket.close();
    }
        
    // Unload all message history
    dispatch(messageHistoryActions.unload());
    
    // Tell server we're leaving (fire and forget)
    model.call([ 'chatRooms', roomName, 'leave' ], []).then(response => response);
    
    dispatch({
      type: ActionTypes.LEAVE_ROOM
    });
  };
};