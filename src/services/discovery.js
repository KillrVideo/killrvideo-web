import Promise from 'bluebird';
import memoize from 'memoizee';

/**
 * Finds the location for a service and returns a Promise that resolves to a string of the hostname:port.
 */
export const findServiceAsync = memoize(
  function findServiceAsync(fullyQualifiedName) {
    // TODO: Configurable service discovery
    return Promise.resolve('localhost:50000');
  }, { primitive: true });