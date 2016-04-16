import Promise from 'bluebird';
import memoize from 'memoizee';
import memoizeMethods from 'memoizee/methods';
import d from 'd';
import { findServiceAsync } from './discovery';
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

/**
 * Custom promisifier for Grpc since currently doesn't follow node style callbacks where the callback
 * if the last argument. (There is a ticket open to fix this and it will change in a release soon).
 */
function GrpcPromisifier(originalMethod) {
  switch (originalMethod.name) {
    case 'makeUnaryRequest':
      return function makeUnaryRequestAsync(request, metadata, opts) {
        let self = this;
        return Promise.fromCallback(cb => {
          originalMethod.call(self, request, cb, metadata, opts);
        });
      };
    default:
      throw new Error('Not supported yet');
  }
}

/**
 * Turn service call arguments into strings so that memoization works properly.
 */
function normalizeAsyncServiceCall(args) {
  let argsStr = '';
  for (let i = 0; i < args.length; i++) {
    argsStr += JSON.stringify(args[i]);
  }
  return argsStr;
}

// Services and their class/constructor mapped by fully qualified service name
const serviceRegistrations = new Map();

/**
 * Register a service with the cache and returns the fully qualified name of the service.
 */
export function registerService(ClientConstructor) {
  // Grpc client constructor functions currently have a name property set to 'Client'
  if (ClientConstructor.name !== 'Client' || !ClientConstructor.service) {
    throw new Error('ClientConstructor must be a grpc Service constructor');
  }
  
  // Use the reflection value on the constructor to get the service name
  const serviceName = getFullyQualifiedName(ClientConstructor.service);
  if (serviceRegistrations.has(serviceName)) {
    throw new Error(`There is already a service registered for ${serviceName}`);
  }
  
  // Promisify all methods on the prototype (which should have the actual service methods)
  Promise.promisifyAll(ClientConstructor.prototype, { promisifier: GrpcPromisifier });
  
  // Create a class for the service client
  class ServiceClient {
    constructor() {
    }
  }
  
  ServiceClient.__serviceName = serviceName;
  
  // Static memoized function for getting a Grpc client for this service (all instances of this service will 
  // share a single underlying Grpc client)
  ServiceClient.__getClientAsync = memoize(function() {
    return findServiceAsync(serviceName).then(host => new ClientConstructor(host, credentials.createInsecure()));
  });
  
  // Static method for dispatching to a function on the underlying client
  ServiceClient.__withClient = function(methodName, ...args) {
    return ServiceClient.__getClientAsync()
      .then(client => {
        return client[methodName](...args);
      });
  };
  
  // Define properties on the ServiceClient class that get the client and then call the same method on the client
  const serviceClientMethodDescriptors = {};
  Object.getOwnPropertyNames(ClientConstructor.prototype).forEach(propName => {
    let prop = ClientConstructor.prototype[propName];
    if (typeof prop === 'function' && propName.endsWith('Async')) {
      // For each async method on the real client, create a method on our ServiceClient class that gets the
      // real client (async), then calls the corresponding method on the real client
      let argsStrings = [];
      for (let i = 0; i < prop.length; i++) {
        argsStrings.push(`arg${i}`);
      }
      let argsStr = argsStrings.join(', ');
      let value = eval(`(function ${propName}(${argsStr}) { return ServiceClient.__withClient('${propName}', ${argsStr}); })`);
      serviceClientMethodDescriptors[propName] = d(value, { normalizer: normalizeAsyncServiceCall, primitive: true });
    }
  });
  
  // Memoize those methods where the results are cached for each ServiceClient instance
  Object.defineProperties(ServiceClient.prototype, memoizeMethods(serviceClientMethodDescriptors));
  
  // Save registration
  serviceRegistrations.set(serviceName, ServiceClient);
  return serviceName;
};

/**
 * Gets a new service client instance for the given service name.
 */
export function getServiceClient(serviceName) {
  const ServiceClient = serviceRegistrations.get(serviceName);
  if (!ServiceClient) {
    throw new Error(`A service with name ${serviceName} is not registered`);
  }
  return new ServiceClient();
};
