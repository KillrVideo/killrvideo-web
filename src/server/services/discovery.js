import { lookupServiceAsync } from '../utils/lookup-service';
import { withRetries } from '../utils/with-retries';

/**
 * Finds the location for a service and returns a Promise that resolves to a string of the IP:Port.
 */
export function findServiceAsync(fullyQualifiedName) {
  // Get just the service name from the fully qualified name
  let nameParts = fullyQualifiedName.split('.');
  let serviceName = nameParts[nameParts.length - 1];
  
  // Insert a dash before any capital letters, convert to lowercase, and remove any leading dash
  serviceName = serviceName.replace(/[ABCDEFGHIJKLMNOPQRSTUVWXYZ]/g, '-$&').toLowerCase();
  if (serviceName.startsWith('-')) {
    serviceName = serviceName.substr(1);
  }
  
  // We should have something like 'video-catalog-service' now, so try and find the service with retries
  // using 50101 as the default port for Grpc services 
  let lookupFn = lookupServiceAsync.bind(undefined, serviceName, '50101');
  return withRetries(lookupFn, 10, 1, `Unable to find service ${serviceName}`, true)
    .then(hosts => { return hosts[0]; });
};