import Router from 'falcor-router';

import routes from './mock-routes';

// The actual router class
class KillrVideoRouter extends Router.createClass(routes) {
  constructor(requestContext) {
    super();
    
    // Save the request context for use by routes
    this.requestContext = requestContext;
  }
}

// Export the class
export default KillrVideoRouter;