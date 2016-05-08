import { logger } from '../../utils/logging';
import Promise from 'bluebird';

/**
 * Decorator for wrapping falcor routes and logging any errors when they are executed.
 */
export function logErrors(route, fn) {
  switch (fn.name) {
    case 'get':
      return function get(...args) {
        let [ pathSet ] = arguments;
        try {
          let result = fn.apply(this, args);
          if (result instanceof Promise) {
            result.catch(err => {
              logger.log('error', 'Error during falcor GET %j', { route, pathSet }, err);
              throw err;
            });
          }
          return result;
        }
        catch (err) {
          logger.log('error', 'Error during falcor GET %j', { route, pathSet }, err);
          throw err;
        }
      };
    case 'call':
      return function call(...args) {
        let [ callPath, callArgs ] = arguments;
        try {
          let result = fn.apply(this, args);
          if (result instanceof Promise) {
            result.catch(err => {
              logger.log('error', 'Error during falcor CALL %j', { route, callPath, callArgs }, err);
              throw err;
            });
          }
          return result;
        } 
        catch (err) {
          logger.log('error', 'Error during falcor CALL %j', { route, callPath, callArgs }, err);
          throw err;
        }
      };
    default:
      return fn;
  }
};

export default logErrors;