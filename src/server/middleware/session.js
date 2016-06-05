import Promise from 'bluebird';
import expressSession from 'express-session';
import CassandraStore from 'cassandra-store';
import config from 'config';
import { logger, getCassandraClientAsync, withRetries } from 'killrvideo-nodejs-common';

// Wrap CassandraStore around the express session
const CassandraSessionStore = CassandraStore(expressSession);

// Creates the session storage table if it doesn't already exist
const createSessionTableIfNotExistsAsync = Promise.method(client => {
  const table = config.get('web.session.cassandra.table');
  const cql = `
    CREATE TABLE IF NOT EXISTS ${table} (
      sid text,
      session text,
      expires timestamp,
      PRIMARY KEY (sid)
    )`;
  
  return client.executeAsync(cql);
});

// Internal function for creating the Cassandra session middleware
const createSessionMiddleware = Promise.method(() => {
  const { keyspace } = config.get('cassandra');
  
  // Get a client for the keyspace, create the table if necessary, then create the middleware
  return getCassandraClientAsync(keyspace)
    .then(client => createSessionTableIfNotExistsAsync(client).return(client))
    .then(client => {
      const { name, secret, cassandra: { table } } = config.get('web.session');
      
      // Create Cassandra session storage
      const store = new CassandraSessionStore({ table, client });
      
      // Return the express session middleware
      return expressSession({
        name,
        secret,
        resave: false,
        saveUninitialized: false,
        store
      });
    })
    .catch(err => {
      logger.log('error', 'Error while creating session middleware', err);
      throw err;
    });
});

/**
 * Creates Express session middleware. Returns a promise that will return a middleware function
 * once resolved.
 */
export function sessionAsync() {
  return withRetries(createSessionMiddleware, 10, 10, 'Could not create session middleware', false);
};