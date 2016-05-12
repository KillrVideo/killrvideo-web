import express from 'express';
import { createServer } from 'http';
import SocketIO from 'socket.io';
import config from 'config';

import { initMiddlewareAsync } from './middleware';
import { handleConnection } from './chat-handler';
import { logger } from './utils/logging';

function startServer(app) {
  // Create the server
  const server = createServer(app);

  // Attach some logging to start/stop
  server.on('listening', () => {
    logger.log('info', 'KillrVideo Web Server listening on %j', server.address());
  });
  server.on('close', () => {
    logger.log('info', 'KillrVideo Web Server is closed');
  });
  
  // Listen for websocket connections
  const io = SocketIO(server);
  io.on('connection', handleConnection);

  // Start the server
  const { port } = config.get('web');
  server.listen(port);
  return server;
}

logger.log('info', 'Trying to start KillrVideo Web Server');

// Create the express app
const expressApp = express();

// Run KillrVideo web server
let startPromise = initMiddlewareAsync(expressApp).then(startServer)
  .catch(err => {
    logger.log('error', 'Unable to start KillrVideo Web Server', err);
    process.exit(1);
  });

// If we get SIGINT, try and cancel/exit
process.on('SIGINT', function handleSigint() {
  logger.log('info', 'Got SIGINT, attempting to shutdown');
  
  if (startPromise.isFulfilled()) {
    let server = startPromise.value;
    server.close(() => process.exit(0));
  } else {
    startPromise.cancel();
    process.exit(0);
  }
});