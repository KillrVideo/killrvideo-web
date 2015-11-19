import { createStore, applyMiddleware, compose } from 'redux';
import { reduxReactRouter } from 'redux-router';
import thunk from 'redux-thunk';
import { createHistory } from 'history';
import createLogger from 'redux-logger';

import routes from 'routes';
import rootReducer from 'reducers';

const createTheStore = compose(
  applyMiddleware(thunk),
  reduxReactRouter({ routes: routes, createHistory: createHistory }),
  applyMiddleware(createLogger())
)(createStore);

export default function configureStore(initialState) {
  const store = createTheStore(rootReducer, initialState);
  return store;
}
