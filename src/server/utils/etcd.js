import Promise from 'bluebird';
import { concat as httpGet } from 'simple-get';
import { logger } from 'killrvideo-nodejs-common';
import { ExtendableError } from './extendable-error';

// In development environments, look for the docker IP to access etcd
if (process.env.NODE_ENV === 'development' && !!process.env.KILLRVIDEO_DOCKER_IP) {
  process.env['KILLRVIDEO_ETCD'] = `${process.env.KILLRVIDEO_DOCKER_IP}:2379`;
}

// Make sure we know where to go for configuration
if (!!process.env.KILLRVIDEO_ETCD === false) {
  throw new Error('The KILLRVIDEO_ETCD environment variable is not set');
}

const ETCD_URL = `http://${process.env.KILLRVIDEO_ETCD}/v2/keys/killrvideo`;
logger.log('info', `Using etcd endpoint ${ETCD_URL}`);

const getAsync = Promise.promisify(httpGet, { multiArgs: true });

/**
 * Error thrown when getting keys from etcd returns a status other than 200 OK.
 */
export class GetKeysError extends ExtendableError {
  constructor(response, body) {
    super('Error getting keys from etcd');
    
    this.statusCode = response.statusCode;
    this.statusMessage = response.statusMessage;
    this.body = body;
  }
};

function getKeysAsync(path) {
  let url = `${ETCD_URL}${path}`;
  return getAsync(url)
    .spread((res, data) => {
      if (res.statusCode !== 200) {
        throw new GetKeysError(res, data.toString());
      }
      return JSON.parse(data.toString());
    });
}

/**
 * Get the values for the keys at the given path in etcd. Returns a Promise of an array of values.
 */
export function getValuesAsync(path) {
  return getKeysAsync(path)
    .then(res => {
      if (res.node.dir !== true) {
        throw new Error(`${path} is not a directory in etcd`);
      }
      return res.node.nodes.map(n => n.value);
    });
};

/**
 * Gets a single value for the key at the given path in etcd. Returns a Promise of the value.
 */
export function getValueAsync(path) {
  return getKeysAsync(path)
    .then(res => {
      if (res.node.dir === true) {
        throw new Error(`${path} is a directory in etcd`);
      }
      return res.node.value;
    });
};

/**
 * Gets a single value for the key at the given path in etcd and if the key is not found, returns the defaultValue instead.
 */
export function getValueOrDefaultAsync(path, defaultValue) {
  return getValueAsync(path)
    .catch(GetKeysError, err => {
      if (err.statusCode === 404){
        return defaultValue;
      }
      
      throw err;
    });
};