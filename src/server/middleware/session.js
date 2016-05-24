import Promise from 'bluebird';
import expressSession from 'express-session';
import CassandraStore from 'cassandra-store';
import config from 'config';
import { Client } from 'cassandra-driver';
import { lookupServiceAsync } from '../utils/lookup-service';
import { withRetries } from '../utils/with-retries';

// Wrap CassandraStore around the express session
const CassandraSessionStore = CassandraStore(expressSession);

// Functions for looking up Cassandra and DSE services 
const lookupCassandra = lookupServiceAsync.bind(undefined, 'cassandra', '9042');
const lookupDse = lookupServiceAsync.bind(undefined, 'datastax-enterprise', '9042');

/**
 * Returns a promise that will return the Express session middleware function.
 */
function createSessionMiddlewareAsync() {
  // Get settings from config
  const { name, secret, cassandra } = config.get('web.session');
  
  let cass = withRetries(lookupCassandra, 10, 2, 'Error looking up cassandra service', true);
  let dse = withRetries(lookupDse, 10, 2, 'Error looking up datastax-enterprise service', true);
  
  // Find cassandra or DSE
  return Promise.any([ cass, dse ])
    .then(contactPoints => {
      // Cancel both lookup promises since at least one is resolved now
      cass.cancel();
      dse.cancel();
      
      // Create a client and promisify the connect method
      let client = new Client({
        contactPoints, 
        keyspace: cassandra.keyspace,
        queryOptions: { prepare: true } 
      });
      
      let connectFn = Promise.promisify(client.connect, { context: client });
      return withRetries(connectFn, 10, 2, 'Error connecting Cassandra client for session storage', true).return(client);
    })
    .then(client => {
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
}

/**
 * Creates Express session middleware. Returns a promise that will return a middleware function
 * once resolved.
 */
export const sessionAsync = Promise.method(createSessionMiddlewareAsync);