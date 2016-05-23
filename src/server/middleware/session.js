import Promise from 'bluebird';
import expressSession from 'express-session';
import CassandraStore from 'cassandra-store';
import config from 'config';
import { Client } from 'cassandra-driver';
import { logger } from '../utils/logging';

// Wrap CassandraStore around the express session
const CassandraSessionStore = CassandraStore(expressSession);

function doInitialConnectWithRetry(connectFn) {
  let retryCount = 0;
  const delayMs = 10000;
  
  function doIt() {
    return connectFn().catch(err => {
      // Max of 10 retries otherwise bail
      if (retryCount >= 10) {
        throw err;
      }
      
      logger.log('verbose', `Error connecting to Cassandra, retrying again in ${delayMs}ms`, err);
      retryCount++;
      return Promise.delay(delayMs).then(doIt);
    });
  }
  
  return doIt();
}

/**
 * Creates Express session middleware. Returns a promise that will return a middleware function
 * once resolved.
 */
export const sessionAsync = Promise.method(() => {
  // Get settings from config
  const { name, secret, cassandra } = config.get('web.session');
  
  // Create a client and promisify the connect method
  let client = new Client({ 
    contactPoints: cassandra.contactPoints, 
    keyspace: cassandra.keyspace,
    queryOptions: { prepare: true } 
  });
  let connect = Promise.promisify(client.connect, { context: client });
  
  // Keep trying to connect until we succeed then return the middleware
  return doInitialConnectWithRetry(connect).then(() => {
    // Create Cassandra storage
    const store = new CassandraSessionStore({
      table: cassandra.table,
      client
    });
    
    // Return the express session middleware
    return expressSession({
      name,
      secret,
      resave: false,
      saveUninitialized: false,
      store
    });
  });
});