import falcor from 'falcor';
import HttpDataSource from 'falcor-http-datasource';
import { Promise } from 'lib/promise';

class FalcorModel extends falcor.Model {
  constructor() {
    super({
      // Do queries via HTTP to model.json with a 60s timeout to allow devs time to step through code
      source: new HttpDataSource('/model.json', { timeout: 60000 })
    });
  }

  get(...args) {
    return Promise.resolve(super.get(...args));
  }

  set(...args) {
    return Promise.resolve(super.set(...args));
  }

  call(...args) {
    return Promise.resolve(super.call(...args));
  }
}

// Export singleton instance of the Falcor Model
const model = new FalcorModel().batch();
export { model };
export default model;

/**
 * Helper function like lodash's values function but users Falcor.keys to enumerate the object's
 * properties (thus omitting stuff like the __path property);
 */
export function falcorValues(obj) {
  return falcor.keys(obj).map(k => obj[k]);
};