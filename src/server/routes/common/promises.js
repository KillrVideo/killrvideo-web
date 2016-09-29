import R from 'ramda';
import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import { logger } from '../../utils/logging';
import { status } from 'grpc';

/**
 * A map with the status code number as the keys and the property names (i.e. description of
 * that code) as the values.
 */
const GRPC_STATUS_CODE_NAMES = Object.keys(status).reduce((acc, name) => {
  let code = status[name];
  acc[code] = name;
  return acc;
}, {});

export const catchErrors = R.invoker(1, 'catch');

export function handleRequestErrors(serviceName) {
  const errMsg = `Error while calling service ${serviceName}`;
  
  return function logAndReturnFalcorError(err) {
    let msg = errMsg;
    if (err.code) {
      msg = `${errMsg} (STATUS CODE: ${GRPC_STATUS_CODE_NAMES[err.code]})`;
    }
    logger.log('error', msg, err);
    return $error();
  };
};