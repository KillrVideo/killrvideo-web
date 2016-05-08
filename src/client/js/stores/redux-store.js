import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import promise from 'redux-promise-middleware';
import { browserHistory } from 'react-router';
import { syncHistory } from 'react-router-redux';
import { promiseTypeSuffixes } from 'actions/promises';

import rootReducer from 'reducers';


// Create some middleware
const reduxRouterMiddleware = syncHistory(browserHistory);
const promiseMiddleware = promise({ promiseTypeSuffixes });
const loggingMiddleware = createLogger();

// Create function for creating the store
const createStoreWithMiddleware = applyMiddleware(
  thunk, 
  reduxRouterMiddleware, 
  promiseMiddleware, 
  loggingMiddleware
)(createStore);

// Create singleton instance of the store with empty initial state and export
export const store = createStoreWithMiddleware(rootReducer, {});
export default store;