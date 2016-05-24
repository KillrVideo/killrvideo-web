import { logger } from '../../utils/logging';

function logFalcor(fn) {
  switch (fn.name) {
    case 'get':
      return function get(...args) {
        let [ pathSet ] = arguments;
        logger.log('verbose', 'Falcor GET', { pathSet });
        return fn.apply(this, args);
      };
    case 'call':
      return function call(...args) {
        let [ callPath, callArgs ] = arguments;
        logger.log('verbose', 'Falcor CALL', { callPath, callArgs });
        return fn.apply(this, args);
      };
    default:
      return fn;
  }
}

export { logFalcor as logRequests };
export default logFalcor;