import Promise from 'bluebird';
import config from 'config';
import { createKeyspaceIfNotExistsAsync } from 'killrvideo-nodejs-common';

/**
 * Initialize Cassandra keyspace.
 */
export function initCassandraAsync() {
  return Promise.try(() => {
    const { keyspace, replication } = config.get('cassandra');
    return createKeyspaceIfNotExistsAsync(keyspace, replication);
  });
};