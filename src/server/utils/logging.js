import { Logger, transports as CoreTransports } from 'winston';

// Just log to the consoleby default
let transports = [];
transports.push(new CoreTransports.Console());

/**
 * The default logger for the application.
 */
export const logger = new Logger({ transports });

export default logger;