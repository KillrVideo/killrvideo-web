import Promise from 'bluebird';
import config from 'config';
import { Client, auth, types as CassandraTypes } from 'dse-driver';
import { lookupServiceAsync } from './lookup-service';
import { logger } from '../utils/logging';

// Client promises by keyspace
const clientPromises = new Map();

/**
 * Gets a Cassandra client instance that is connected to the specified keyspace.
 */
export function getCassandraClientAsync(keyspace, dseUsername, dsePassword) {
  if (clientPromises.has(keyspace)) {
    return clientPromises.get(keyspace);
  }

  const promise = lookupServiceAsync('cassandra')
    .then(contactPoints => {
      let clientOpts = {
        contactPoints,
        queryOptions: {
          prepare: true,
          consistency: CassandraTypes.consistencies.localQuorum
        }
      };

      if (keyspace) {
        clientOpts.keyspace = keyspace;
      }

      /** 
       * Check for both KILLRVIDEO_DSE_USERNAME and KILLRVIDEO_DSE_PASSWORD environment
       * variables.  If they both exist use the values set within them.  If not,
       * use default values for authentication.
       */
      if (dseUsername && dsePassword) {
        let passwordLength = dsePassword.length;
        logger.info('Using supplied DSE username: "' + dseUsername + '" and password: "***' + dsePassword.substring(passwordLength - 4, passwordLength) + '" from environment variables')

        // Use the values passed in from the config
        clientOpts.authProvider = new auth.DsePlainTextAuthProvider(dseUsername, dsePassword);

      } else {
        logger.info('No detected username/password combination was passed in. DSE cluster authentication method was NOT executed.');
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

/**
 * Creates a keyspace in Cassandra if it doesn't already exist. Pass the name of the keyspace and the
 * string to be used as the REPLICATION setting (i.e. after WITH REPLIACTION = ...).
 */
function createKeyspaceIfNotExistsAsync(keyspace, replication, dseUsername, dsePassword) {
  // Create CQL
  const cql = `CREATE KEYSPACE IF NOT EXISTS ${keyspace} WITH REPLICATION = ${replication}`;
  
  // Get a client, then create the keyspace
  return getCassandraClientAsync(null, dseUsername, dsePassword).then(client => client.executeAsync(cql));
}

/**
 * Initialize Cassandra keyspace.
 */
export function initCassandraAsync() {
  return Promise.try(() => {
    const { keyspace, replication, dseUsername, dsePassword } = config.get('cassandra');
    return createKeyspaceIfNotExistsAsync(keyspace, replication, dseUsername, dsePassword);
  });
};
