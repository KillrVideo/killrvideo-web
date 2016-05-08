import R from 'ramda';
import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import { logger } from '../../utils/logging';

export const catchErrors = R.invoker(1, 'catch');

export function handleRequestErrors(serviceName) {
  const errMsg = `Error while calling service ${serviceName}`;
  
  return function logAndReturnFalcorError(err) {
    logger.log('error', errMsg, err);
    return $error();
  };
};