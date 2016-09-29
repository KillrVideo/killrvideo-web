import { Logger, transports as CoreTransports } from 'winston';
import config from 'config';

/**
 * The default winston logger instance.
 */
export const logger = new Logger({
  transports: [ new CoreTransports.Console({ level: 'verbose', timestamp: true, colorize: true, stderrLevels: [ 'error' ] }) ]
});

/**
 * Adjust the logging level of the default logger instance.
 */
export function setLoggingLevel(level) {
  logger.transports.console.level = level;
};

// Lazy calculate value once
let debugEnabled = null;

/**
 * Function that returns true if debug logging is enabled or false if not.
 */
export function isDebugEnabled() {
  if (debugEnabled !== null) return debugEnabled;

  let level = config.get('loggingLevel').toLowerCase();
  debugEnabled = (level === 'debug' || level === 'silly'); 
  return debugEnabled;
};

export default logger;

