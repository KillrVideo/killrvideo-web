import { Logger, transports as CoreTransports } from 'winston';
import config from 'config';
import { join } from 'path';
import mkdirp from 'mkdirp';

// Figure out what transports to use from config
let transports = [];

if (config.get('logging.console.enabled') === true) {
  transports.push(new CoreTransports.Console());
}

if (config.get('logging.file.enabled') === true) {
  // Ensure the path to the logs exists
  let p = join(process.cwd(), config.get('logging.file.path'));
  mkdirp.sync(p);
  
  // Add file (stream) transport
  transports.push(new CoreTransports.File({
    filename: join(p, config.get('logging.file.name')),
    maxsize: 1000000,
    maxFiles: 10,
    tailable: true,
    json: false
  }));
}


/**
 * The default logger for the application.
 */
export const logger = new Logger({ transports });

export default logger;