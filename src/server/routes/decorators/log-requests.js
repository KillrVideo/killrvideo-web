import { logger } from 'killrvideo-nodejs-common';

function logFalcor(routeType, routeFn) {
  switch (routeType) {
    case 'get':
      return function logGetRequest(...args) {
        let [ pathSet ] = arguments;
        logger.log('verbose', 'Falcor GET', { pathSet });
        return routeFn.apply(this, args);
      };
    case 'call':
      return function logCallRequest(...args) {
        let [ callPath, callArgs ] = arguments;
        logger.log('verbose', 'Falcor CALL', { callPath, callArgs });
        return routeFn.apply(this, args);
      };
    default:
      return routeFn;
  }
}

export { logFalcor as logRequests };
export default logFalcor;