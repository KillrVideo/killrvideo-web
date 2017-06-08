import Promise from 'bluebird';
import config from 'config';
import { Client, types as CassandraTypes } from 'dse-driver';
import { lookupServiceAsync } from './lookup-service';

// Client promises by keyspace
const clientPromises = new Map();
const dse = require('dse-driver');

/**
 * Gets a Cassandra client instance that is connected to the specified keyspace.
 */
export function getCassandraClientAsync(keyspace) {
  if (clientPromises.has(keyspace)) {
    return clientPromises.get(keyspace);
  }
    
  const promise = lookupServiceAsync('cassandra')
    .then(contactPoints => {
      let clientOpts = {
        contactPoints,
        authProvider: new dse.auth.DsePlainTextAuthProvider("cassandra", "cassandra"), 
        queryOptions: { 
          prepare: true,
          consistency: CassandraTypes.consistencies.localQuorum
        }
      };
      
      if (keyspace) {
        clientOpts.keyspace = keyspace;
      }
      
      // Create a client and promisify it
      let client = new dse.Client(clientOpts);
      client = Promise.promisifyAll(client);
      
      // Connect and return the connected client
      return client.connectAsync().return(client);
    })
    .catch(err => {
      clientPromises.delete(keyspace);
      throw err;
    });
  
  clientPromises.set(keyspace, promise);
  return promise;
};

/**
 * Creates a keyspace in Cassandra if it doesn't already exist. Pass the name of the keyspace and the
 * string to be used as the REPLICATION setting (i.e. after WITH REPLIACTION = ...).
 */
function createKeyspaceIfNotExistsAsync(keyspace, replication) {
  // Create CQL
  const cql = `CREATE KEYSPACE IF NOT EXISTS ${keyspace} WITH REPLICATION = ${replication}`;
  
  // Get a client, then create the keyspace
  return getCassandraClientAsync().then(client => client.executeAsync(cql));
}


/**
 * Initialize Cassandra keyspace.
 */
export function initCassandraAsync() {
  return Promise.try(() => {
    const { keyspace, replication } = config.get('cassandra');
    return createKeyspaceIfNotExistsAsync(keyspace, replication);
  });
};