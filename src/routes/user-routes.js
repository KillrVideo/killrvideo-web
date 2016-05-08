import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import uuid from 'uuid';
import { USER_MANAGEMENT_SERVICE } from '../services/user-management';
import { uuidToString, stringToUuid } from '../utils/protobuf-conversions';
import { pipe, prop } from 'ramda';
import { createPropPicker } from './common/props';
import * as Common from './common';
import { logger } from '../utils/logging';

const userMap = {
  'userId': pipe(prop('userId'), uuidToString)
};

const pickUserProps = createPropPicker(userMap);

// List of routes supported by the user management service
const routes = [
  {
    // Reference to the currently logged in user
    route: 'currentUser',
    get(pathSet) {
      // The router has a method for getting the currently logged in user's id
      const userId = this.getCurrentUserId();
      return { 
        jsonGraph: { currentUser: userId ? $ref([ 'usersById', userId ]) : $atom() } 
      };
    }
  },
  {
    // Lookup users by their unique id
    route: 'usersById[{keys:userIds}]["userId", "firstName", "lastName", "email"]',
    get: Common.batchedServiceRequest(
      paths => ({ userIds: paths.map(path => stringToUuid(path[1])) }),
      USER_MANAGEMENT_SERVICE,
      (req, client) => { return client.getUserProfileAsync(req); },
      (path, profile) => path[1] === uuidToString(profile.userId),
      pickUserProps
    )
  },
  {
    // Log a user into the system
    route: 'currentUser.login',
    call(callPath, args) {
      let [ email, password ] = args;
      let client = this.getServiceClient(USER_MANAGEMENT_SERVICE);
      return client.verifyCredentialsAsync({ email, password })
        .tap(response => {
          // Log the user in if successfully verified
          if (!response.userId) {
            return;
          }
          return this.setCurrentUserId(uuidToString(response.userId));
        })
        .then(response => {
          return [
            { path: [ 'currentUser' ], value: $ref([ 'usersById', uuidToString(response.userId) ]) }
          ];
        })
        .catch(err => {
          logger.log('error', 'Error logging a user in', err);
          return [
            { path: [ 'currentUser', 'loginErrors' ], value: $error(err.message) }
          ];
        });
    }
  },
  {
    // Log a user out of the system
    route: 'currentUser.logout',
    call(callPath, args) {
      this.clearCurrentUserId();
      return [
        { path: [ 'currentUser' ], invalidated: true }
      ];
    }
  },
  {
    // Register a new user
    route: 'currentUser.register',
    call(callPath, args) {
      let [ firstName, lastName, email, password ] = args;
      let userId = uuid.v4();
      let client = this.getServiceClient(USER_MANAGEMENT_SERVICE);
      
      return client.createUserAsync({
          firstName, lastName, email, password, userId: stringToUuid(userId)
        })
        .tap(response => {
          // This will only get called on non-errors, so log the user in if successful
          return this.setCurrentUserId(userId);
        })
        .then(response => {
          return [
            { path: [ 'currentUser' ], value: $ref([ 'usersById', userId ]) }
          ];
        })
        .catch(err => {
          logger.log('error', 'Error registering user', err);
          return [
            { path: [ 'currentUser', 'registerErrors' ], value: $error(err.message) }
          ];
        });
    }
  }
];

export default routes;