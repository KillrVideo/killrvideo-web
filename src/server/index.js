import express from 'express';
import { createServer } from 'http';
import SocketIO from 'socket.io';
import config from 'config';
import Promise from 'bluebird';

import { initMiddlewareAsync } from './middleware';
import { handleConnection } from './chat-handler';
import { initCassandraAsync } from './utils/cassandra';
import { logger, setLoggingLevel, withRetries } from 'killrvideo-nodejs-common';

// Enable cancellation on Promises
Promise.config({ cancellation: true });

// Try to start the server
const startPromise = Promise.try(() => {
  // Set default logging level based on config
  let loggingLevel = config.get('loggingLevel');
  setLoggingLevel(loggingLevel);
  logger.log(loggingLevel, `Logging initialized at ${loggingLevel}`);

  logger.log('info', 'Trying to start KillrVideo Web Server');
  return withRetries(initCassandraAsync, 10, 10, 'Could not initialize Cassandra keyspace', false);
})
.then(() => {
  // Create the express app and init middleware
  const expressApp = express();
  return initMiddlewareAsync(expressApp).return(expressApp);
})
.then(app => {
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
})
.catch(err => {
  logger.log('error', 'Unable to start KillrVideo Web Server', err);
  process.exit(1);
});

// If we get SIGINT, try and cancel/exit
process.on('SIGINT', function handleSigint() {
  logger.log('info', 'Got SIGINT, attempting to shutdown');
  
  if (startPromise.isFulfilled()) {
    let server = startPromise.value();
    server.close(() => process.exit(0));
  } else {
    startPromise.cancel();
    process.exit(0);
  }
});