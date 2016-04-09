import expressSession from 'express-session';
import CassandraStore from 'cassandra-store';
import config from 'config';

const CassandraSessionStore = CassandraStore(expressSession);

/**
 * Creates Express session middleware
 */
export function session() {
  // Get settings from config
  const { name, secret, cassandra } = config.get('web.session');
  
  // Create Cassandra storage
  const store = new CassandraSessionStore({
    table: cassandra.table,
    clientOptions: {
      contactPoints: cassandra.contact_points,
      keyspace: cassandra.keyspace,
      queryOptions: {
        prepare: true
      }
    }
  });
  
  // Return the express session middleware
  return expressSession({
    name,
    secret,
    resave: false,
    saveUninitialized: false,
    store
  });
};