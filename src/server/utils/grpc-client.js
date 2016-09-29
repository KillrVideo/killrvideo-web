import { load, credentials, getClientChannel } from 'grpc';
import grpcExt from 'grpc/src/node/src/grpc_extension.js';
import Promise from 'bluebird';
import { lookupServiceAsync } from './lookup-service';
import { logger } from './logging';

/**
 * Reverse lookup (int value => name) of gRPC connectivity states.
 */
const CONNECTIVITY_STATE_NAMES = Object.keys(grpcExt.connectivityState).reduce((acc, name) => {
  let val = grpcExt.connectivityState[name];
  acc[val] = name;
  return acc;
}, {});

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

// Cache of all service registrations by fully qualified name
const serviceRegistrations = new Map();

/**
 * Loads a Grpc service proto using the specified root and file paths. Then calls the clientConstructorSelector
 * function with the proto as the single argument which should return the Grpc client constructor of the service
 * being loaded. Returns an object with the proto and the fully qualified name of the service.
 */
export function loadServiceProto(rootPath, filePath, clientConstructorSelector) {
  // Load the proto from the file and get the constructor
  const proto = load({ root: rootPath, file: filePath }, 'proto', { convertFieldsToCamelCase: true });
  const ClientConstructor = clientConstructorSelector(proto);
  
  // Grpc client constructor functions currently have a name property set to 'Client'
  if (ClientConstructor.name !== 'Client' || !ClientConstructor.service) {
    throw new Error('ClientConstructor must be a grpc Service constructor');
  }
  
  // Use the reflection value on the constructor to get the service name
  const fullyQualifiedName = getFullyQualifiedName(ClientConstructor.service);
  if (serviceRegistrations.has(fullyQualifiedName)) {
    throw new Error(`There is already a service registered for ${fullyQualifiedName}`);
  }
  
  // Promisify all methods on the prototype (which should have the actual service methods)
  Promise.promisifyAll(ClientConstructor.prototype);
  
  // Save registration
  serviceRegistrations.set(fullyQualifiedName, ClientConstructor);
  
  return {
    proto,
    fullyQualifiedName
  };
};

// Cache of service client promsies by fully qualified name
const serviceClientPromises = new Map();

// Maximum number of transient connection failures to allow before throwing away a client and creating a new one
const MAX_TRANSIENT_FAILURES = 5;

/**
 * Kicks of monitoring of a gRPC client's underlying channel and removes any client
 * from the Promise cache if it has a fatal failure.
 */
function monitorClientChannel(fullyQualifiedName, client) {
  // Get the underlying channel for the client
  let channel = getClientChannel(client);

  // The number of transient failures we've seen
  let failures = 0;

  // Function that will be called recursively to keep track of the client's channel state
  let checkState = function(err) {
    // If called with an error, just remove the cached client Promise
    if (err) {
      logger.log('error', `Unexepected error watching client state for ${fullyQualifiedName}`, err);
      serviceClientPromises.delete(fullyQualifiedName);
      return;
    }

    // Get the latest state, connecting if we're not already connected
    let newState = channel.getConnectivityState(true);
    logger.log('debug', `Channel for ${fullyQualifiedName} has state ${CONNECTIVITY_STATE_NAMES[newState]}`);

    let fatal = false;
    switch (newState) {
      case grpcExt.connectivityState.READY:
        // Reset failure counter if connected
        failures = 0;
        break;

      case grpcExt.connectivityState.TRANSIENT_FAILURE:
        // Keep track of transient failures
        failures++;
        fatal = (failures >= MAX_TRANSIENT_FAILURES);
        break;

      case grpcExt.connectivityState.FATAL_FAILURE:
        fatal = true;
        break;

      default:
        break;
    }

    // If a fatal failure, remove the cached client Promise
    if (fatal) {
      logger.log('debug', `Removing client for ${fullyQualifiedName} from cache`);
      serviceClientPromises.delete(fullyQualifiedName);
      return;
    }

    // Wait for the next state change and call ourself as the callback when the state changes
    channel.watchConnectivityState(newState, Infinity, checkState);
  };

  // Kick off initial state check
  checkState();
}

const _getGrpcClientAsync = Promise.method(fullyQualifiedName => {
  // Get promise from cache if available
  if (serviceClientPromises.has(fullyQualifiedName)) {
    return serviceClientPromises.get(fullyQualifiedName);
  }
  
  // Lookup the registration
  const ClientConstructor = serviceRegistrations.get(fullyQualifiedName);
  if (!ClientConstructor) {
    throw new Error(`A service with name ${fullyQualifiedName} has not been loaded.`);
  }
  
  // Get just the service name from the fully qualified name
  let nameParts = fullyQualifiedName.split('.');
  let serviceName = nameParts[nameParts.length - 1];
  
  // Lookup the service, create the client and return it
  const promise = lookupServiceAsync(serviceName)
    .then(hosts => new ClientConstructor(hosts[0], credentials.createInsecure()))
    .catch(err => {
      // Remove from promise cache
      serviceClientPromises.delete(fullyQualifiedName);
      throw err;
    })
    .tap(client => {
      // Monitor the underlying channel on a client for fatal errors
      monitorClientChannel(fullyQualifiedName, client);
    });
  
  serviceClientPromises.set(fullyQualifiedName, promise);
  return promise;
});

/**
 * Gets a Grpc service client by the service's fully qualified name.
 */
export function getGrpcClientAsync(fullyQualifiedName) {
  return _getGrpcClientAsync(fullyQualifiedName);
};