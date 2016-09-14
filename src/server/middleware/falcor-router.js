import bodyParser from 'body-parser';
import { dataSourceRoute } from 'falcor-express';
import passport from 'passport';
import Promise from 'bluebird';
import util from 'util';
import { logger } from 'killrvideo-nodejs-common';
import { sessionAsync } from './session';
import { KillrVideoRouter } from '../routes';
import { isDebugEnabled } from '../utils/is-debug-enabled';

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
 * Returns a Promise of an array of Express middleware for handling Falcor router requests.
 */
export function falcorRouterAsync() {
  return sessionAsync().then(session => {
    return [
      // Parse POST body for requests to falcor endpoint
      bodyParser.urlencoded({ extended: false }),
      // Session storage
      session,
      // Passport authentication
      passport.initialize(),
      passport.session(),
      // Dispatch to Falcor router
      dataSourceRoute((req, res) => new KillrVideoRouter(req))
    ];
  });
};