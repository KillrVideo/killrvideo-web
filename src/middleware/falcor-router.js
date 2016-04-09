import bodyParser from 'body-parser';
import { dataSourceRoute } from 'falcor-express';
import Router from 'falcor-router';
import { session } from './session';
import routes from '../routes';

/**
 * Returns an array of Express middleware for handling Falcor router requests.
 */
export function falcorRouter() {
  return [
    // Parse POST body for requests to falcor endpoint
    bodyParser.urlencoded({ extended: false }),
    // Session storage
    session(),
    // Dispatch to Falcor router
    dataSourceRoute((req, res) => new KillrVideoRouter(new RequestContext(req, res)))
  ];
};

/**
 * The Falcor router implementation
 */
class KillrVideoRouter extends Router.createClass(routes) {
  constructor(requestContext) {
    super();
    
    // Save the request context for use by routes
    this.requestContext = requestContext;
  }
}

/**
 * Simple class for wrapping the current express request that provides some convenience methods
 * for retrieving the current user.
 */
class RequestContext {
  constructor(request, response) {
    this.request = request;
    this.response = response;
  }
  
  getUserId() {
    // User id is stored in the auth cookie
    return this.request.cookies[COOKIE_NAME];
  }
  
  setUserId(userId) {
    // Just use the user Id as the auth token (obviously not something we would do in production)
    this.response.cookie(COOKIE_NAME, userId);
  }
  
  clearUserId() {
    this.response.clearCookie(COOKIE_NAME);
  }
}