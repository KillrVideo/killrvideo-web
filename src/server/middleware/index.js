import { static as expressStatic } from 'express';

import { logErrors } from './log-errors';
import { handleErrors } from './handle-errors';
import { falcorRouterAsync } from './falcor-router';
import { appHtml } from './app-html';

/**
 * Asynchronously initialize middleware and return the app when finished.
 */
export function initMiddlewareAsync(app) {
  // Serve up static build assets for the client
  app.use('/static', expressStatic(`${__dirname}/../../client`));
    
  return falcorRouterAsync().then(falcorRouter => {
    // Falcor requests to model.json
    app.use('/model.json', falcorRouter);

    // All other requests serve up the server.html page 
    app.get('/*', appHtml());

    // Error handlers
    app.use(logErrors());
    app.use(handleErrors());
    
    // Return app initialized now with middleware
    return app;
  });
};