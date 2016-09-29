import { getEtcdValuesAsync, GetEtcdKeysError } from './etcd';
import { logger } from './logging';
import { ExtendableError } from './extendable-error';

/**
 * Error thrown when a service can't be found in etcd.
 */
export class ServiceNotFoundError extends ExtendableError {
  constructor(serviceName) {
    super(`Could not find service ${serviceName} in etcd`);
  }
};

/**
 * Looks up a service with a given name. Returns an array of strings in the format of 'ip:port'.
 */
export function lookupServiceAsync(serviceName) {
  logger.log('verbose', `Looking up service ${serviceName}`);
  
  return getEtcdValuesAsync(`/services/${serviceName}`)
    .tap(hosts => {
      logger.log('verbose', `Found service ${serviceName} at ${JSON.stringify(hosts)} in etcd`);
    })
    .catch(GetEtcdKeysError, err => {
      if (err.statusCode === 404) {
        throw new ServiceNotFoundError(serviceName);
      }

      throw err;
    });
};