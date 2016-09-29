import express from 'express';
import { createServer } from 'http';
import { createInterface } from 'readline';
import SocketIO from 'socket.io';
import config from 'config';
import Promise from 'bluebird';
import { setLogger } from 'grpc';

import { initMiddlewareAsync } from './middleware';
import { handleConnection } from './chat-handler';
import { initCassandraAsync } from './utils/cassandra';
import { logger, setLoggingLevel } from './utils/logging'; 
import { withRetries } from './utils/promises';

// Enable cancellation on Promises
Promise.config({ cancellation: true });

// Try to start the server
const startPromise = Promise.try(() => {
  // Set default logging level based on config
  let loggingLevel = config.get('loggingLevel');
  setLoggingLevel(loggingLevel);
  logger.log(loggingLevel, `Logging initialized at ${loggingLevel}`);

  // Set gRPC logging to log via the main logger at DEBUG level
  setLogger({
    error(msg) {
      logger.log('debug', msg);
    }
  });

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
  console.error('Unable to start KillrVideo Web Server');
  console.error(err);
  process.exit(1);
});

function stop() {
  logger.log('info', 'Attempting to shutdown');
  if (startPromise.isFulfilled()) {
    let server = startPromise.value();
    server.close(() => process.exit(0));
  } else {
    startPromise.cancel();
    process.exit(0);
  }
}

// Try to gracefully shutdown on SIGTERM and SIGINT
process.on('SIGTERM', stop);
process.on('SIGINT', stop);

// Graceful shutdown attempt in Windows
if (process.platform === 'win32') {
  // Simulate SIGINT on Windows (see http://stackoverflow.com/questions/10021373/what-is-the-windows-equivalent-of-process-onsigint-in-node-js)
  createInterface({
    input: process.stdin,
    output: process.stdout
  })
  .on('SIGINT', () => process.emit('SIGINT'));
}