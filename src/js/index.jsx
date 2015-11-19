import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { ReduxRouter } from 'redux-router';
import configureStore from 'stores/configure-store';

const store = configureStore();

render(
  <Provider store={store}>
    <ReduxRouter /> 
  </Provider>,
  document.getElementById('killrvideo')
);