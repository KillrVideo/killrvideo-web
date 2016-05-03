import config from 'config';
import { toError } from './common/sentinels';

const routes = [
  {
    // Get configuration keys from the client section
    route: 'configuration[{keys:configKeys}]',
    get(pathSet) {
      return pathSet.configKeys.map(key => {
        let clientKey = `client.${key}`;
        return {
          path: [ 'configuration', key ],
          value: config.has(clientKey) ? config.get(clientKey) : toError('Configuration not found')
        };
      });
    }
  }
];

export default routes;