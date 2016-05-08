import { logger } from '../utils/logging';

/**
 * Express middleware for logging errors.
 */
export function logErrors() {
  return (err, req, res, next) => {
    let message = err.stack
      ? err.stack
      : err.message
        ? err.message
        : 'An unexpected error occurred';
        
    logger.log('error', message, {
      method: req.method,
      url: req.originalUrl || req.url,
      error: err
    });
    next(err);
  };
};