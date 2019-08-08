import { Promise as PromiseLib } from 'bluebird';

// Enable cancellation on Promises
PromiseLib.config({ cancellation: true });

// Export as default and as Promise
export default PromiseLib;
export const Promise = PromiseLib;