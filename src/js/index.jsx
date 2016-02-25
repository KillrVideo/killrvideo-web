import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import router from 'router';
import store from 'stores/redux-store';

// Require basic CSS needed by the app
require('bootswatch/cosmo/bootstrap.css');
require('font-awesome/css/font-awesome.css');
require('gemini-scrollbar/gemini-scrollbar.css');
require('app.css');

render(
  <Provider store={store}>
    {router}
  </Provider>,
  document.getElementById('killrvideo')
);