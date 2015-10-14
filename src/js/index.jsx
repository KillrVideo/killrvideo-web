import 'babel-core/polyfill';
import React from 'react';
import { Provider } from 'react-redux';
import { ReduxRouter } from 'redux-router';
import configureStore from 'store/configure-store';

const store = configureStore();

React.render(
  <Provider store={store}>
    {() => <ReduxRouter />} 
  </Provider>,
  document.getElementById('killrvideo')
);