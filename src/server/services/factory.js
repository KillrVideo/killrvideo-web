import Promise from 'bluebird';
import memoize from 'memoizee';
import { getGrpcClientAsync } from '../utils/grpc-client';

/**
 * Turn service call arguments into strings so that memoization works properly.
 */
function normalizeAsyncServiceCall(args) {
  let argsStr = '';
  for (let i = 0; i < args.length; i++) {
    try {
      argsStr += JSON.stringify(args[i]);
    } catch(err) {
      console.error('Failed to stringify given object: ${err}', args[i])
    }
  }
  return argsStr;
}

/**
 * Wraps a memoized function in one that clears its cache after a short timeout. This allows multiple requests
 * to a service within quick succession to use the same values.
 */
function wrapMemoizedServiceCallWithInvalidation(memoizedFn) {
  let invalidationScheduled = false;
  
  return function doServiceCall(...args) {
    // Invoke the memoized function with the arguments
    let results = memoizedFn(...args);
    
    // If we haven't scheduled an invalidation yet, do it
    if (invalidationScheduled === false) {
      process.nextTick(function clearMemoizedFnCache() {
        memoizedFn.clear();
        invalidationScheduled = false;
      });
      invalidationScheduled = true;
    }
    
    return results;
  };
}

/**
 * Ensures a service client's methods have been memoized.
 */
function ensureMemoized(clientInstance) {
  if (clientInstance.__hasBeenMemoized === true) {
    return clientInstance;
  }
  
  // Look for async methods on the client instance
  let proto = Object.getPrototypeOf(clientInstance);
  Object.getOwnPropertyNames(proto).forEach(propName => {
    let prop = proto[propName];
    if (typeof prop === 'function' && propName.endsWith('Async')) {
      let newFn = memoize(prop.bind(clientInstance), { normalizer: normalizeAsyncServiceCall, primitive: true });
      newFn = wrapMemoizedServiceCallWithInvalidation(newFn);
      proto[propName] = newFn;
    }
  });
  
  clientInstance.___hasBeenMemoized = true;
  return clientInstance;
}

/**
 * Get a Grpc service client by the service's fully qualified name.
 */
export function getServiceClientAsync(fullyQualifiedName) {
  return getGrpcClientAsync(fullyQualifiedName)
    .then(ensureMemoized);
};