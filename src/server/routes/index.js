import Router from 'falcor-router';
import Promise from 'bluebird';

import { PagingStateCache } from '../utils/paging-state-cache';

import { logRequests } from './decorators/log-requests';
import { logErrors } from './decorators/log-errors';

import commentsRoutes from './comments-routes';
import ratingsRoutes from './ratings-routes';
import searchRoutes from './search-routes';
import statsRoutes from './stats-routes';
import suggestionsRoutes from './suggestions-routes';
import uploadsRoutes from './uploads-routes';
import userRoutes from './user-routes';
import videoRoutes from './video-routes';

// Combine all routes into a single array
const routes = [
  ...commentsRoutes,
  ...ratingsRoutes,
  ...searchRoutes,
  ...statsRoutes,
  ...suggestionsRoutes,
  ...uploadsRoutes,
  ...userRoutes,
  ...videoRoutes
// Wrap routes with decorators
].map(route => {
  // The string representing the route definition
  let routeDef = route.route;

  // Find the function (should be 'get', 'call', or 'set')
  let routeType = Object.keys(route).find(prop => typeof route[prop] === 'function');
  if (!routeType) {
    throw new Error('Unexpected route object without a function');
  }  
  
  let routeFn = route[routeType];

  // Wrap with decorators
  let value = logErrors(routeDef, routeType, routeFn);
  value = logRequests(routeType, value);
  Object.defineProperty(route, routeType, { value });
  return route;
});

let blah = routes;

/**
 * The Falcor router implementation
 */
export class KillrVideoRouter extends Router.createClass(routes) {
  constructor(req) {
    super();
    
    // Save the request for use by routes
    this.req = req;
    this.pagingStateCache = new PagingStateCache(req);
  }
    
  /**
   * Gets the currently logged in user's id.
   * 
   * @returns {string} The currently logged in user's id or null if no user is logged in.
   */
  getCurrentUserId() {
    // Passport should set the user on the request
    return this.req.user
      ? this.req.user
      : null;
  }
  
  /**
   * Sets the currently logged in user to the id provided.
   * 
   * @param {string} The user id for the user that's logged in.
   * @returns {Promise} A promise that resolves once the userId has been successfully set.
   */
  setCurrentUserId(userId) {
    return Promise.fromCallback(cb => {
      this.req.login(userId, cb);
    });
  }
  
  /**
   * Clears the currently logged in user.
   */
  clearCurrentUserId() {
    this.req.logout();
  }
}

export default KillrVideoRouter;