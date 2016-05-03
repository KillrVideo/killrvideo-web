import { logger } from '../../utils/logging';
import config from 'config';

function noOp(fn) {
  return fn;
}

function logFalcor(fn) {
  switch (fn.name) {
    case 'get':
      return function get(...args) {
        let [ pathSet ] = arguments;
        logger.log('info', 'Falcor GET', { pathSet });
        return fn.apply(this, args);
      };
    case 'call':
      return function call(...args) {
        let [ callPath, callArgs ] = arguments;
        logger.log('info', 'Falcor CALL', { callPath, callArgs });
        return fn.apply(this, args);
      };
    default:
      return fn;
  }
}

// If configured to log falcor requests, export the function otherwise just export no-op function
let logFn = noOp;
if (config.get('logging.logFalcorRequests') === true) {
  logFn = logFalcor;
}

export { logFn as logRequests };
export default logFn;