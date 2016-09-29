import { logger, isDebugEnabled } from '../../utils/logging';
import { EOL } from 'os';
import util from 'util';
import config from 'config';

/**
 * Helper function for determining if an object looks like a Promise. From:
 * https://github.com/then/is-promise/blob/master/index.js
 */
function isPromise(obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}

const INSPECT_OPTS = { depth: 5, colors: true, breakLength: 80 };

/**
 * Does util.inspect with consistent options.
 */
function inspect(obj) {
  return util.inspect(obj, INSPECT_OPTS);
}

function logFalcor(routeDef, routeType, routeFn) {
  switch (routeType) {
    case 'get':
      return function logGetRequest(...args) {
        let [ pathSet ] = arguments;
        try {
          let result = routeFn.apply(this, args);

          // Log request and results once complete if a Promise
          if (isPromise(result)) {
            return result.then(
              response => {
                if (isDebugEnabled()) {
                  logger.log('debug', `Falcor ROUTE '${routeDef}'${EOL}${inspect({ pathSet, response })}`);
                }
                return response;
              },
              err => {
                logger.log('error', `Falcor ROUTE '${routeDef}'${EOL}${inspect({ pathSet })}${EOL}`, err);
                throw err;
              }
            );
          }

          // Log request and response now
          let response = result;
          if (isDebugEnabled()) {
            logger.log('debug', `Falcor ROUTE '${routeDef}'${EOL}${inspect({ pathSet, response })}`);
          }
          return result;
        } catch (err) {
          logger.log('error', `Falcor ROUTE '${routeDef}'${EOL}${inspect({ pathSet })}${EOL}`, err);
          throw err;
        }
      };
    case 'call':
      return function logCallRequest(...args) {
        let [ callPath, callArgs ] = arguments;
        try {
          let result = routeFn.apply(this, args);

          // Log request and results once complete if a Promise
          if (isPromise(result)) {
            return result.then(
              response => {
                if (isDebugEnabled()) {
                  logger.log('debug', `Falcor ROUTE '${routeDef}'${EOL}${inspect({ callPath, callArgs, response })}${EOL}${inspect(response)}`);
                }
                return response;
              },
              err => {
                logger.log('error', `Falcor ROUTE '${routeDef}'${EOL}${inspect({ callPath, callArgs })}${EOL}`, err);
                throw err;
              }
            );
          }

          // Log request and response now
          let response = result;
          if (isDebugEnabled()) {
            logger.log('debug', `Falcor ROUTE '${routeDef}'${EOL}${inspect({ callPath, callArgs, response })}${EOL}${inspect(result)}`);
          }
          return result;
        } catch (err) {
          logger.log('error', `Falcor ROUTE '${routeDef}'${EOL}${inspect({ callPath, callArgs })}${EOL}`, err);
          throw err;
        }
      };
    default:
      return routeFn;
  }
}

export { logFalcor as logRequests };
export default logFalcor;