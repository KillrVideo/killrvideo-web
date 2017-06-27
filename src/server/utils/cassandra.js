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

  /** 
   * Check for both KILLRVIDEO_DSE_USERNAME and KILLRVIDEO_DSE_PASSWORD environment
   * variables.  If they both exist use the values set within them.  If not,
   * use default values for authentication.
   */
  let dseUsername = process.env.KILLRVIDEO_DSE_USERNAME
    ? `${process.env.KILLRVIDEO_DSE_USERNAME}`
    : 'cassandra';

  let dsePassword = process.env.KILLRVIDEO_DSE_PASSWORD
    ? `${process.env.KILLRVIDEO_DSE_PASSWORD}`
    : 'cassandra';

  if (dseUsername === 'cassandra' && dsePassword === 'cassandra') {
    console.log('Using default DSE username and password as at least one was not provided.  If you are not attempting to to set these values then this really doesn\'t matter.  If you are, check to ensure both KILLRVIDEO_DSE_USERNAME and KILLRVIDEO_DSE_PASSWORD are set in your environment');

  } else {
    let passwordLength = dsePassword.length;
    console.log('Using supplied DSE username: "' + dseUsername + '" and password: "***' + dsePassword.substring(passwordLength - 4, passwordLength) + '" from environment variables')
  }
    
  const promise = lookupServiceAsync('cassandra')
    .then(contactPoints => {
      let clientOpts = {
        contactPoints,
        authProvider: new dse.auth.DsePlainTextAuthProvider(dseUsername, dsePassword), 
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
