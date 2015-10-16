import { Model } from 'falcor';
import cache from './sample-data-cache';

const model = new Model({cache});

// Export singleton instance of the Falcor Model
export default model;