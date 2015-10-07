const history = require('history');
const createHistory = history.createHistory;
const useQueries = history.useQueries;

// Export a singleton instance of the history
export default useQueries(createHistory)()