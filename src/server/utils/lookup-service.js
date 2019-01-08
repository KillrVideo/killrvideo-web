import { logger } from './logging';
import { ExtendableError } from './extendable-error';
import Promise from 'bluebird';

let registry = {
  'dse-search': 'dse:8983',
  'web': 'web:3000',
  'cassandra': 'dse:9042',
  'VideoCatalogService': 'backend:50101',
  'UserManagementService': 'backend:50101',
  'CommentsService': 'backend:50101',
  'RatingsService': 'backend:50101',
  'SearchService': 'backend:50101',
  'StatisticsService': 'backend:50101',
  'SuggestedVideoService': 'backend:50101',
  'UploadsService': 'backend:50101'
};

/**
 * Error thrown when a service can't be found
 */
export class ServiceNotFoundError extends ExtendableError {
  constructor(serviceName) {
    super(`Could not find service ${serviceName}`);
  }
};

/**
 * Looks up a service with a given name. Returns an array of strings in the format of 'ip:port'.
 */
export function lookupServiceAsync(serviceName) {
  logger.log('verbose', `Looking up service ${serviceName}`);
  
  if (!(serviceName in registry)) {
    logger.log('error', `Found no service ${serviceName}`);
    throw new ServiceNotFoundError(serviceName);
  }

  logger.log('verbose', `Found service ${serviceName} at ${registry[serviceName]}`);

  return new Promise (function(resolve, reject){resolve([registry[serviceName]])}); 
};
