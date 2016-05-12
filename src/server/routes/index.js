import Router from 'falcor-router';
import Promise from 'bluebird';

import { getServiceClient } from '../services/factory';
import { PagingStateCache } from '../utils/paging-state-cache';

import { logRequests } from './decorators/log-requests';
import { logErrors } from './decorators/log-errors';

import commentsRoutes from './comments-routes';
import ratingsRoutes from './ratings-routes';
import sampleDataRoutes from './sample-data-routes';
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
  ...sampleDataRoutes,
  ...searchRoutes,
  ...statsRoutes,
  ...suggestionsRoutes,
  ...uploadsRoutes,
  ...userRoutes,
  ...videoRoutes
];

// Wrap routes with decorators
routes.forEach(route => {
  // The string representing the route definition
  let routeDef = route.route;
  
  // Look for function on the route object (should be a 'get', 'call', 'set', etc.)
  Object.keys(route).forEach(prop => {
    if (typeof route[prop] === 'function') {
      // Wrap function with decorator functions
      let value = logRequests(logErrors(routeDef, route[prop]));
      Object.defineProperty(route, prop, { value });
    }
  });
});

/**
 * The Falcor router implementation
 */
export class KillrVideoRouter extends Router.createClass(routes) {
  constructor(req) {
    super();
    
    // Save the request for use by routes
    this.req = req;
    this.pagingStateCache = new PagingStateCache(req);
    this.serviceClients = new Map();
  }
  
  /**
   * Gets a service client for the given service. Client instances are shared for the duration
   * of a request.
   */
  getServiceClient(serviceName) {
    let client = this.serviceClients.get(serviceName);
    if (!client) {
      client = getServiceClient(serviceName);
      this.serviceClients.set(serviceName, client);
    }
    return client;
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