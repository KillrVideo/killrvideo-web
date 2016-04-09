import bodyParser from 'body-parser';
import { dataSourceRoute } from 'falcor-express';
import passport from 'passport';
import Promise from 'bluebird';
import Router from 'falcor-router';
import { session } from './session';
import routes from '../routes';

// Tell passport auth how to serialize and deserialize users
passport.serializeUser(function(user, done) {
  // Our code really just passes a uuid string for user, so just use it as-is
  done(null, user);
});

passport.deserializeUser(function(id, done) {
  // No deserialization necessary since we just work with a uuid string for a user
  return done(null, id);
});

/**
 * Returns an array of Express middleware for handling Falcor router requests.
 */
export function falcorRouter() {
  return [
    // Parse POST body for requests to falcor endpoint
    bodyParser.urlencoded({ extended: false }),
    // Session storage
    session(),
    // Passport authentication
    passport.initialize(),
    passport.session(),
    // Dispatch to Falcor router
    dataSourceRoute((req, res) => new KillrVideoRouter(req))
  ];
};

/**
 * The Falcor router implementation
 */
class KillrVideoRouter extends Router.createClass(routes) {
  constructor(req) {
    super();
    
    // Save the request for use by routes
    this.req = req;
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