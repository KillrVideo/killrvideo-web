import { Model } from 'falcor';
import HttpDataSource from 'falcor-http-datasource';

// Do queries via HTTP to model.json
const source = new HttpDataSource('/model.json');
const model = new Model({ source });

// Export singleton instance of the Falcor Model
export default model;