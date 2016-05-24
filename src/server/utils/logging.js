import { Logger, transports as CoreTransports } from 'winston';
import config from 'config';

const level = config.get('logging.level');

// Just log to the consoleby default
let transports = [];
transports.push(new CoreTransports.Console({ level }));

/**
 * The default logger for the application.
 */
export const logger = new Logger({ transports });

export default logger;