import { isUndefined, range, findIndex, remove, sortBy } from 'lodash';
import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import moment from 'moment';
import uuid from 'uuid';
import { getIndexesFromRanges } from './util';

import getUsers from './data/users';
import getComments from './data/comments';
import { getPubSub } from '../chat-handler';

const addedDatePeriods = [
  'hours', 'minutes', 'seconds'
];

const chatRoomData = {};

// Helper function for lazily generating sample data for a chat room
function getChatRoomData(roomName) {
  // Have we created sample data already for that room?
  if (!isUndefined(chatRoomData[roomName])) {
    return chatRoomData[roomName];
  }
  
  const userIds = getUsers().map(u => u.userId);
  const comments = getComments();
  
  // Use the length of the room name (stable) to determine how many users and where to start pulling them
  const usersStartIdx = (roomName.length * 3) % userIds.length;
  const numberOfUsers = (roomName.length * 8) % userIds.length;
  
  const users = range(0, numberOfUsers).map(i => {
    const idx = (usersStartIdx + i) % userIds.length;
    return userIds[idx];
  });
  
  // Use length of the room name (stable) to determine how many messages and where to start pulling them
  const messagesStartIdx = (roomName.length * 4) % comments.length;
  const numberOfMessages = roomName.length * 11;
  
  let addedDate = moment();
  const messages = range(0, numberOfMessages).map(i => {
    // Pick out the chat message content from the sample comment data
    const idx = (messagesStartIdx + i) % comments.length;
    const message = comments[idx];
    
    // Pick a user who sent the message from users
    const userIdx = idx % users.length;
    const author = userIds[userIdx];
    
    // Pick a date for the message
    const periodIdx = message.length % addedDatePeriods.length;
    const period = addedDatePeriods[periodIdx];
    const intervalLength = message.length % 24;
    addedDate = addedDate.subtract(intervalLength, period);
    
    return {
      messageId: uuid.v4(),
      message,
      author,
      addedDate: addedDate.toISOString()
    };
  }).reverse(); // Reverse so messages are in order from oldest -> newest
  
  // Create a sample message history and current user list
  const sampleRoomData = {
    users,
    messages
  };
    
  // Store and return
  chatRoomData[roomName] = sampleRoomData;
  return sampleRoomData;
}

const routes = [
  {
    // Join a chat room
    route: 'chatRooms[{keys:roomNames}].join',
    call(callPath, args) {
      let pathValues = [];
      
      // Sanity check
      if (callPath.roomNames.length !== 1) {
        return callPath.roomNames.map(roomName => ({ 
          path: [ 'chatRooms', roomName ], 
          value: $error('Can only join one chat room at a time') 
        }));
      }
      
      const roomName = callPath.roomNames[0];
      
      // Get current user
      const userId = this.requestContext.getUserId();
      if (isUndefined(userId)) {
        pathValues.push({
          path: [ 'chatRooms', roomName ],
          value: $error('Not currently logged in')
        });
        return pathValues;
      }
      
      // This would be a call to KillrChat POST /rooms/:roomName to create room if not exists
      const roomData = getChatRoomData(roomName);
      
      // This would be a call to KillrChat PUT /rooms/participant/:roomName to add user to the chat room participants
      if (findIndex(roomData.users, uid => uid === userId) === -1) {
        roomData.users.push(userId);
      }
      
      // Invalidate any existing data the user may have in the cache for the room
      pathValues.push({
        path: [ 'chatRooms', roomName ],
        invalidated: true
      });
      
      // Notify room of join using our simulated pubSub
      const pubSub = getPubSub(roomName);
      pubSub.notifyJoined(userId);
      
      return pathValues;
    }
  },
  {
    // Leave a chat room
    route: 'chatRooms[{keys:roomNames}].leave',
    call(callPath, args) {
      let pathValues = [];
      
      // Sanity check
      if (callPath.roomNames.length !== 1) {
        return callPath.roomNames.map(roomName => ({ 
          path: [ 'chatRooms', roomName ], 
          value: $error('Can only leave one chat room at a time') 
        }));
      }
      
      const roomName = callPath.roomNames[0];
      
      // Get current user
      const userId = this.requestContext.getUserId();
      if (isUndefined(userId)) {
        pathValues.push({
          path: [ 'chatRooms', roomName ],
          value: $error('Not currently logged in')
        });
        return pathValues;
      }
      
      const roomData = getChatRoomData(roomName);
      
      // This would be a call to KillrChat PATCH /rooms/participant/:roomName to remove current user from room
      remove(roomData.users, uid => uid === userId);
      
      // Invalidate any existing data the user may have in the cache for the room
      pathValues.push({
        path: [ 'chatRooms', roomName ],
        invalidated: true
      });
      
      // Notify room user left using our simulated pubSub
      const pubSub = getPubSub(roomName);
      pubSub.notifyLeft(userId);
      
      return pathValues;
    }
  },
  {
    // Get initial chat room message history
    route: 'chatRooms[{keys:roomNames}].messages',
    get(pathSet) {
      let pathValues = [];
      
      pathSet.roomNames.forEach(roomName => {
        const chatRoomData = getChatRoomData(roomName);
        
        // Return a reference starting from the latest message Id
        const latestMessageId = chatRoomData.messages[chatRoomData.messages.length - 1].messageId;
        pathValues.push({
          path: [ 'chatRooms', roomName, 'messages' ],
          value: $ref([ 'chatRooms', roomName, 'messageHistory', latestMessageId ])
        });
      });
      
      return pathValues;
    }
  },
  {
    route: 'chatRooms[{keys:roomNames}].messageHistory[{keys:firstMessageIds}][{ranges:indexRanges}]["messageId", "message", "addedDate", "author"]',
    get(pathSet) {
      const messageProps = pathSet[5];
      let pathValues = [];
      
      pathSet.roomNames.forEach(roomName => {
        // Sanity check (should only have a single first message Id)
        if (pathSet.firstMessageIds.length !== 1) {
          pathSet.firstMessagesIds.forEach(messageId => {
            pathValues.push({
              path: [ 'chatRooms', roomName, 'messageHistory', messageId ],
              value: $error('Can only specify one first message Id for chat message history')
            });
          });
          return;
        }
        
        const firstMessageId = pathSet.firstMessageIds[0];
        const chatRoomData = getChatRoomData(roomName);
        const firstMessageIndex = findIndex(chatRoomData.messages, m => m.messageId === firstMessageId);
        
        getIndexesFromRanges(pathSet.indexRanges).forEach(idx => {
          // Do we actually have a message at that index?
          const messageIdx = firstMessageIndex - idx;
          if (messageIdx < 0) {
            pathValues.push({
              path: [ 'chatRooms', roomName, 'messageHistory', firstMessageId, idx ],
              value: $atom()
            });
            return;
          }
          
          const message = chatRoomData.messages[messageIdx];
          messageProps.forEach(messageProp => {
            // If asking for author, return a reference to the user by id
            const propValue = messageProp === 'author' 
              ? $ref( [ 'usersById', message['author'] ]) 
              : message[messageProp];
              
            pathValues.push({
              path: [ 'chatRooms', roomName, 'messageHistory', firstMessageId, idx, messageProp ],
              value: propValue
            });
          });
        });
      });
      
      return pathValues;
    }
  },
  {
    // Get initial number of users in a chat room
    route: 'chatRooms[{keys:roomNames}].users.length',
    get(pathSet) {
      let pathValues = [];
      
      pathSet.roomNames.forEach(roomName => {
        const chatRoomData = getChatRoomData(roomName);
        pathValues.push({
          path: [ 'chatRooms', roomName, 'users', 'length' ],
          value: chatRoomData.users.length
        });
      });
      
      return pathValues;
    }
  },
  {
    // Get data on the initial users in a chat room
    route: 'chatRooms[{keys:roomNames}].users[{ranges:indexRanges}]',
    get(pathSet) {
      let pathValues = [];
      
      pathSet.roomNames.forEach(roomName => {
        const chatRoomData = getChatRoomData(roomName);
        getIndexesFromRanges(pathSet.indexRanges).forEach(idx => {
          pathValues.push({
            path: [ 'chatRooms', roomName, 'users', idx ],
            value: $ref([ 'usersById', chatRoomData.users[idx] ])
          });
        });
      });
      
      return pathValues;
    }
  },
  {
    // Send a new chat message
    route: 'chatRooms[{keys:roomNames}].sendMessage',
    call(callPath, args) {
      const [ messageBody ] = args;
      
      let pathValues = [];
      
      // Sanity check
      if (callPath.roomNames.length !== 1) {
        return callPath.roomNames.map(roomName => ({ 
          path: [ 'chatRooms', roomName ], 
          value: $error('Can only send a message to one chat room at a time') 
        }));
      }
      
      const roomName = callPath.roomNames[0];
      
      // Get current user
      const userId = this.requestContext.getUserId();
      if (isUndefined(userId)) {
        pathValues.push({
          path: [ 'chatRooms', roomName ],
          value: $error('Not currently logged in')
        });
        return pathValues;
      }
      
      // Add a new message to the chat room data
      const roomData = getChatRoomData(roomName);
      const newMessage = {
        messageId: uuid.v4(),
        message: messageBody,
        author: userId,
        addedDate: moment().toISOString()
      };
      roomData.messages.push(newMessage);
      
      // Create some pathValues for the new message
      const messagePath = [ 'chatRooms', roomName, 'messagesById', newMessage.messageId ];
      pathValues.push({ path: [ ...messagePath, 'messageId' ], value: newMessage.messageId });
      pathValues.push({ path: [ ...messagePath, 'message' ], value: newMessage.message });
      pathValues.push({ path: [ ...messagePath, 'author' ], value: $ref([ 'usersById', newMessage.author ]) });
      pathValues.push({ path: [ ...messagePath, 'addedDate' ], value: newMessage.addedDate });
      
      // Let everyone know about the new message via our simulated pub-sub
      const pubSub = getPubSub(roomName);
      pubSub.notifyMessage(newMessage.messageId, pathValues);
      
      return pathValues;
    }
  }
];

export default routes;