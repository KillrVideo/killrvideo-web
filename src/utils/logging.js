import { Logger, transports } from 'winston';

/**
 * The default logger for the application.
 */
export const logger = new Logger({
  transports: [
    new transports.Console()
  ]
});

export default logger;