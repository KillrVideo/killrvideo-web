import { getValuesAsync } from './etcd';
import { logger } from './logging';

/**
 * Looks up a service with a given name. Returns an array of strings in the format of 'ip:port'.
 */
export function lookupServiceAsync(serviceName) {
  logger.log('verbose', `Looking up service ${serviceName}`);
  
  return getValuesAsync(`/services/${serviceName}`)
    .tap(hosts => {
      logger.log('verbose', `Found service ${serviceName} at ${JSON.stringify(hosts)} in etcd`);
    });
};