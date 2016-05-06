import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import router from 'router';
import store from 'stores/redux-store';
import { setConfig } from 'actions/config';

// Require icon used so it's included in any bundles
require('killrvideo-icon.png');

// Require basic CSS needed by the app
require('bootswatch/cosmo/bootstrap.css');
require('font-awesome/css/font-awesome.css');
require('gemini-scrollbar/gemini-scrollbar.css');
require('app.css');

export function renderApp(el, opts) {
  // Configure the app
  store.dispatch(setConfig(opts.clientConfig));
  
  // Render the app  
  render(
    <Provider store={store}>
      {router}
    </Provider>,
    el
  );
};

export default renderApp;
