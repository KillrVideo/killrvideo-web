import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import router from 'router';
import store from 'stores/redux-store';

// Require icon used so it's included in any bundles
require('killrvideo-icon.png');

// Require basic CSS needed by the app
require('bootswatch/cosmo/bootstrap.css');
require('font-awesome/css/font-awesome.css');
require('gemini-scrollbar/gemini-scrollbar.css');
require('app.css');

function KillrVideo(el, opts) {
  render(
    <Provider store={store}>
      {router}
    </Provider>,
    el
  );
};

// This doesn't export things properly with webpack right now (see https://github.com/webpack/webpack/issues/706), so
// use the old module.exports syntax instead in this one place
// export default KillrVideo;
module.exports = KillrVideo;
