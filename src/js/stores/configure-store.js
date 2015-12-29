import { createStore, applyMiddleware, compose } from 'redux';
import { reduxReactRouter } from 'redux-router';
import thunk from 'redux-thunk';
import { createHistory } from 'history';
import createLogger from 'redux-logger';
import promise from 'redux-promise-middleware';

import routes from 'routes';
import rootReducer from 'reducers';
import { promiseTypeSuffixes } from 'actions/promises';

const createTheStore = compose(
  applyMiddleware(thunk, promise({ promiseTypeSuffixes })),
  reduxReactRouter({ routes: routes, createHistory: createHistory }),
  applyMiddleware(createLogger())
)(createStore);

export default function configureStore(initialState) {
  const store = createTheStore(rootReducer, initialState);
  return store;
};
