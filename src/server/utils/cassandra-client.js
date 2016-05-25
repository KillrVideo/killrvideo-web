import config from 'config';
import Promise from 'bluebird';
import { Client } from 'cassandra-driver';

import { lookupServiceAsync } from '../utils/lookup-service';

// Client promises by keyspace
const clientPromises = new Map();

/**
 * Gets a Cassandra client instance that is connected to the specified keyspace.
 */
export function getCassandraClientAsync(keyspace) {
  if (clientPromises.has(keyspace)) {
    return clientPromises.get(keyspace);
  }
    
  const promise = lookupServiceAsync('cassandra', '9042')
    .then(contactPoints => {
      let clientOpts = {
        contactPoints,
        queryOptions: { prepare: true }
      };
      
      if (keyspace) {
        clientOpts.keyspace = keyspace;
      }
      
      // Create a client and promisify it
      let client = new Client(clientOpts);
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

// Internal function for creating the schema
function createKeyspaceIfNotExists() {
  // Get keyspace info from config
  const { keyspace, replication } = config.get('cassandra');
  
  // Create CQL from that info
  const cql = `CREATE KEYSPACE IF NOT EXISTS ${keyspace} WITH REPLICATION = ${replication}`;
  
  // Get a client, then create the keyspace
  return getCassandraClientAsync().then(client => client.executeAsync(cql));
}

/**
 * Creates the configured keyspace in Cassandra if it doesn't already exist.
 */
export const createKeyspaceIfNotExistsAsync = Promise.method(createKeyspaceIfNotExists);