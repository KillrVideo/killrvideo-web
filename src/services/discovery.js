import Promise from 'bluebird';
import { credentials } from 'grpc';

/**
 * Recursively gets the fully qualified name of a probuf.js reflection value
 */
function getFullyQualifiedName(value) {
  if (value === null || value === undefined) {
    return '';
  }
  
  let name = value.name;
  const parentName = getFullyQualifiedName(value.parent);
  if (parentName !== '') {
    name = parentName + '.' + name;
  }
  return name;
}

// Cache of Promises for all available clients by service name
const clientCache = new Map();

/**
 * Gets a Promise of a Grpc client based on a Service's constructor.
 */
function getClient(ClientConstructor) {
  // Grpc clients currently have a name property set to 'Client'
  if (ClientConstructor.name !== 'Client' || !ClientConstructor.service) {
    throw new Error('ClientConstructor must be a grpc Service constructor');
  }
  
  // Use the reflection value on the constructor to get the service name
  const serviceName = getFullyQualifiedName(ClientConstructor.service);
  let client = clientCache.get(serviceName);
  if (!client) {
    // Create the promise for the client (TODO: Configurable service discovery)
    let clientInstance = new ClientConstructor('localhost:50000', credentials.createInsecure());
    
    // Create async methods on the client that return promises
    clientInstance = Promise.promisifyAll(clientInstance);
       
    // Add Promise to cache
    client = Promise.resolve(clientInstance);
    clientCache.set(serviceName, client);
  }
  
  return client;
};

/**
 * Gets a client for the specified Grpc Service.
 */
export const getClientAsync = Promise.method(getClient);