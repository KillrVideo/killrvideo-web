import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import { isUndefined } from 'lodash';
import config from 'config';

// Define routes for getting configuration values
const routes = [
  {
    route: 'configuration[{keys:configKeys}]',
    get(pathSet) {
      let pathValues = [];
      pathSet.configKeys.forEach(key => {
        pathValues.push({
          path: [ 'configuration', key ],
          value: config.has(key) === false ? $error('Configuration key not found') : config.get(key)
        });
      });
      return pathValues;
    }
  }
];

export default routes;