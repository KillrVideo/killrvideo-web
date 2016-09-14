import config from 'config';

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