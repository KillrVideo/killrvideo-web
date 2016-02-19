import KillrVideoRouter from './router';

class ChatRoomPubSub {
  constructor() {
    this._sockets = {};
  }
  
  subscribe(socket) {
    this._sockets[socket.id] = socket;
  }
  
  unsubscribe(socket) {
    delete this._sockets[socket.id];
  }
  
  notifyJoined(userId, pathValues) {
    this._publish({
      type: 'chat/USER_JOINED',
      payload: {
        userId,
        pathValues
      }
    });
  }
  
  notifyLeft(userId) {
    this._publish({
      type: 'chat/USER_LEFT',
      payload: {
        userId
      }
    });
  }
  
  notifyMessage(messageId, pathValues) {
    this._publish({
      type: 'chat/NEW_MESSAGE',
      payload: {
        messageId,
        pathValues
      }
    });
  }
  
  _publish(message) {
    const msg = JSON.stringify(message);
    console.log('Publishing %s', msg);
    for (let socketId in this._sockets) {
      let socket = this._sockets[socketId];
      socket.send(msg);
    }
  }
}

const pubSubByChatRoom = {};

// Get the PubSub object for a given chat room or create it if it doesn't exist
export function getPubSub(roomName) {
  let pubSub = pubSubByChatRoom[roomName];
  if (!pubSub) {
    pubSub = new ChatRoomPubSub();
    pubSubByChatRoom[roomName] = pubSub;
  }
  return pubSub;
};

export function handleConnection(socket) {
  socket.on('message', msg => {
    // We only accept one message type (chat/SUBSCRIBE)
    const message = JSON.parse(msg);
    if (message.type === 'chat/SUBSCRIBE') {
      const { roomName } = message.payload;
      const pubSub = getPubSub(roomName);
      pubSub.subscribe(socket);
    }
  });
  
  socket.on('disconnect', () => {
    for (let roomName in pubSubByChatRoom) {
      let pubSub = pubSubByChatRoom[roomName];
      pubSub.unsubscribe(socket);
    }
    console.log('Socket disconnected');
  });
  
  console.log('Socket connected');
};