import Promise from 'bluebird';
import { lookupServiceAsync } from '../utils/lookup-service';

function findService(fullyQualifiedName) {
  // Get just the service name from the fully qualified name
  let nameParts = fullyQualifiedName.split('.');
  let serviceName = nameParts[nameParts.length - 1];
  
  // Insert a dash before any capital letters, convert to lowercase, and remove any leading dash
  serviceName = serviceName.replace(/[ABCDEFGHIJKLMNOPQRSTUVWXYZ]/g, '-$&').toLowerCase();
  if (serviceName.startsWith('-')) {
    serviceName = serviceName.substr(1);
  }
  
  // We should have something like 'video-catalog-service' now, so try and find the service using 50101 
  // as the default port for Grpc services
  return lookupServiceAsync(serviceName, '50101').then(hosts => hosts[0]);
}

/**
 * Finds the location for a service from the fully qualified name and returns a Promise that resolves to a 
 * string of the IP:Port where that service can be found.
 */
export const findServiceAsync = Promise.method(findService);