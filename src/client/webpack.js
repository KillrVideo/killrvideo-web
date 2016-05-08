/**
 * Creates and renders the KillrVideo application in the element specified.
 */
function KillrVideo(el, opts) {
  // Allow the user to pass the base path to webpack static assets as an option
  __webpack_public_path__ = opts.staticPath || '';
  
  // Render the application
  var app = require('./js');
  
  // Kinda a goofy hack, but because of the combination of babel + webpack (see https://github.com/webpack/webpack/issues/706), we
  // need to call either .default() or .renderApp() to get at the exported function from './js'
  app.renderApp(el, opts);
}

module.exports = KillrVideo;