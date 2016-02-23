import { Promise } from 'lib/promise';
import falcor from 'falcor';
import HttpDataSource from 'falcor-http-datasource';

// Have falcor use same promise library as rest of the app
falcor.Promise = Promise;

// Do queries via HTTP to model.json
const source = new HttpDataSource('/model.json');

// Export singleton instance of the Falcor Model
export const model = falcor({ source }).batch();
export default model;

/**
 * Helper function like lodash's values function but users Falcor.keys to enumerate the object's
 * properties (thus omitting stuff like the __path property);
 */
export function falcorValues(obj) {
  return falcor.keys(obj).map(k => obj[k]);
};