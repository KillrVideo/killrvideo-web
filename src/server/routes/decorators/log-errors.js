import { logger } from 'killrvideo-nodejs-common';
import Promise from 'bluebird';

/**
 * Decorator for wrapping falcor routes and logging any errors when they are executed.
 */
export function logErrors(routeDef, routeType, routeFn) {
  switch (routeType) {
    case 'get':
      return function logGetErrors(...args) {
        let [ pathSet ] = arguments;
        try {
          let result = routeFn.apply(this, args);
          if (result instanceof Promise) {
            result.catch(err => {
              logger.log('error', `Error during falcor GET ${JSON.stringify({ routeDef, pathSet })}`, err);
              throw err;
            });
          }
          return result;
        }
        catch (err) {
          logger.log('error', `Error during falcor GET ${JSON.stringify({ routeDef, pathSet })}`, err);
          throw err;
        }
      };
    case 'call':
      return function logCallErrors(...args) {
        let [ callPath, callArgs ] = arguments;
        try {
          let result = routeFn.apply(this, args);
          if (result instanceof Promise) {
            result.catch(err => {
              logger.log('error', `Error during falcor CALL ${JSON.stringify({ route, callPath, callArgs })}`, err);
              throw err;
            });
          }
          return result;
        } 
        catch (err) {
          logger.log('error', `Error during falcor CALL ${JSON.stringify({ route, callPath, callArgs })}`, err);
          throw err;
        }
      };
    default:
      return routeFn;
  }
};

export default logErrors;