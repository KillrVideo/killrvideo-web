import Promise from 'bluebird';
import { lookupServiceAsync } from '../utils/lookup-service';

function findService(fullyQualifiedName) {
  // Get just the service name from the fully qualified name
  let nameParts = fullyQualifiedName.split('.');
  let serviceName = nameParts[nameParts.length - 1];
  
  // We should have something like 'video-catalog-service' now, so try and find the service
  return lookupServiceAsync(serviceName).then(hosts => hosts[0]);
}

/**
 * Finds the location for a service from the fully qualified name and returns a Promise that resolves to a 
 * string of the IP:Port where that service can be found.
 */
export const findServiceAsync = Promise.method(findService);