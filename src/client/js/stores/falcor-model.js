import falcor from 'falcor';
import HttpDataSource from 'falcor-http-datasource';
import { Promise } from 'lib/promise';

// Wrap the given function with Promise.resolve 
function wrapWithPromise(fn) {
  return function withPromise(...args) {
    return Promise.resolve(fn.apply(this, args));
  };
}

// Do queries via HTTP to /model.json with a 60s timeout to allow devs time to step through code
const model = new falcor.Model({
  source: new HttpDataSource('/model.json', { timeout: 60000 })
}).batch();

// Wrap model async methods so they return Promises
model.call = wrapWithPromise(model.call);
model.get = wrapWithPromise(model.get);
model.set = wrapWithPromise(model.set);

// Export singleton instance of the Falcor Model
export { model };

/**
 * Helper function like lodash's values function but users Falcor.keys to enumerate the object's
 * properties (thus omitting stuff like the __path property);
 */
export function falcorValues(obj) {
  return falcor.keys(obj).map(k => obj[k]);
};