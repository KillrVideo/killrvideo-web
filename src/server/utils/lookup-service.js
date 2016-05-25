import { resolve, NODATA, NOTFOUND } from 'dns';
import { format } from 'util';
import config from 'config';
import Promise from 'bluebird';
import { logger } from './logging';
import { ExtendableError } from './extendable-error';

const resolveAsync = Promise.promisify(resolve);
const configLookup = config.get('serviceLookup');

function handleResolveErrors(hostname, recordType, defaultReturnValue) {
  const notFoundMsg = `Could not find ${recordType} record for ${hostname}`;
  
  return function resolveErrorHandler(err) {
    // If not found, just return an empty array
    if (err.code === NODATA || err.code === NOTFOUND) {
      logger.log('verbose', notFoundMsg);
      return defaultReturnValue;
    }
    
    // Otherwise propagate the error
    throw err;
  };
}

/**
 * Error thrown when a service can't be resolved.
 */
export class UnableToResolveServiceError extends ExtendableError {
  constructor(serviceName, errors) {
    super(`Unable to resolve service ${serviceName}`);
    
    this.innerErrors = errors;
  }
};

/**
 * Looks up a service with a given name. Returns an array of strings in the format of 'ip:port'.
 */
export function lookupServiceAsync(serviceName, defaultPort) {
  logger.log('verbose', `Looking up service ${serviceName}`);
  
  // Allow lookup to be overridden in config file
  if (configLookup.has(serviceName)) {
    let resolved = configLookup.get(serviceName);
    if (Array.isArray(resolved) === false) {
      resolved = [ resolved ];
    }
    logger.log('verbose', `Found service ${serviceName} at ${resolved} in serviceLookup config`);
    return Promise.resolve(resolved);
  }
  
  // Construct a hostname from the service name
  let hostname = `${serviceName}.service.killrvideo`;
  
  logger.log('verbose', `Attempting to resolve ${hostname}`);
  
  // Lookup SRV records
  let srvPromise = resolveAsync(hostname, 'SRV')
    .catch(handleResolveErrors(hostname, 'SRV', [ { name: hostname, port: defaultPort } ]))
    .tap(records => { logger.log('verbose', `Resolved SRV records for ${hostname} to ${JSON.stringify(records)}`); });
    
  // Use SRV records to resolve A records
  let aPromise = srvPromise.map(srvAddress => {
    return resolveAsync(srvAddress.name, 'A')
      .catch(handleResolveErrors(srvAddress.name, 'A', []))
      .tap(addresses => { logger.log('verbose', `Resolved A records for ${srvAddress.name} to ${JSON.stringify(addresses)}`); })
      .reflect();
  });
  
  // Use combination of SRV and A records to return any results found
  return Promise.join(srvPromise, aPromise, (srvRecords, aRecordPromises) => {
    let results = [];
    let errors = [];
    for (let i = 0; i < srvRecords.length; i++) {
      // Did the A record query fail?
      if (aRecordPromises[i].isRejected()) {
        errors.push(aRecordPromises[i].reason());
        continue;
      }
      
      // Did we get no A records back?
      let aRecords = aRecordPromises[i].value();
      if (aRecords.length === 0) {
        continue;
      }
      
      // Add the IP addresses from the A record to the port from the SRV record
      let port = srvRecords[i].port;
      Array.prototype.push.apply(results, aRecords.map(ip => `${ip}:${port}`));
    }
    
    // Did we get at least some results?
    if (results.length !== 0) {
      return results;
    }
    
    throw new UnableToResolveServiceError(serviceName, errors);
  })
  .catch(err => {
    if (err instanceof UnableToResolveServiceError === false) {
      logger.log('error', `Error while resolving ${hostname}`, err);
    }
    throw err;
  })
  .tap(hosts => {
    logger.log('verbose', `Found service ${serviceName} at ${JSON.stringify(hosts)} in DNS`);
  });
};