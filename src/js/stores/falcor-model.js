import { Promise } from 'lib/promise';
import falcor from 'falcor';
import HttpDataSource from 'falcor-http-datasource';

// Have falcor use same promise library as rest of the app
falcor.Promise = Promise;

// Do queries via HTTP to model.json
const source = new HttpDataSource('/model.json');
export const model = falcor({ source }).batch();

// Export singleton instance of the Falcor Model
export default model;