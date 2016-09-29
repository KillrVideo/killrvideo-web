import Promise from 'bluebird';
import { concat as httpGet } from 'simple-get';
import { logger } from './logging';
import { ExtendableError } from './extendable-error';

let ETCD_URL = null;

/**
 * Get the URL for etcd. Value is computed once then cached and reused.  
 */
function getEtcdUrl() {
  if (ETCD_URL !== null) return ETCD_URL;

  // In development environments, use the KILLRVIDEO_DOCKER_IP, otherwise look for KILLRVIDEO_ETCD
  let etcdHostAndPort = process.env.NODE_ENV === 'development' && !!process.env.KILLRVIDEO_DOCKER_IP
    ? `${process.env.KILLRVIDEO_DOCKER_IP}:2379`
    : process.env.KILLRVIDEO_ETCD;

  if (!etcdHostAndPort) {
    throw new Error('Could not find etcd IP and port in KILLRVIDEO_ETCD environment variable');
  }

  ETCD_URL = `http://${etcdHostAndPort}/v2/keys/killrvideo`;
  logger.log('verbose', `Using etcd endpoint ${ETCD_URL}`);
  return ETCD_URL;
}

// HTTP get as Promise returning function
const getAsync = Promise.promisify(httpGet, { multiArgs: true });

/**
 * Error thrown when getting keys from etcd returns a status other than 200 OK.
 */
export class GetEtcdKeysError extends ExtendableError {
  constructor(response, body) {
    super('Error getting keys from etcd');
    
    this.statusCode = response.statusCode;
    this.statusMessage = response.statusMessage;
    this.body = body;
  }
};

/**
 * Does the HTTP get to etcd to get the keys at the path specified.
 */
function getKeysAsync(path) {
  let url = `${getEtcdUrl()}${path}`;
  return getAsync(url)
    .spread((res, data) => {
      if (res.statusCode !== 200) {
        throw new GetEtcdKeysError(res, data.toString());
      }
      return JSON.parse(data.toString());
    });
}

/**
 * Get the values for the keys at the given path in etcd. Returns a Promise of an array of values.
 */
export function getEtcdValuesAsync(path) {
  return getKeysAsync(path)
    .then(res => {
      if (res.node.dir !== true) {
        throw new Error(`${path} is not a directory in etcd`);
      }
      return res.node.nodes.map(n => n.value);
    });
};