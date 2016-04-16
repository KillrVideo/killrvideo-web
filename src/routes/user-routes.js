import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import Promise from 'bluebird';
import { USER_MANAGEMENT_SERVICE } from '../services/user-management';
import { uuidToString, stringToUuid } from '../utils/protobuf-conversions';
import { flattenPathValues } from '../utils/falcor-utils';
import { logger } from '../utils/logging';

// List of routes supported by the user management service
const routes = [
  {
    // Reference to the currently logged in user
    route: 'currentUser',
    get(pathSet) {
      // The router has a method for getting the currently logged in user's id
      const userId = this.getCurrentUserId();
      return [
        { 
          path: [ 'currentUser' ], 
          value: userId ? $ref([ 'usersById', userId ]) : $atom() 
        }
      ];
    }
  },
  {
    // Lookup users by their unique id
    route: 'usersById[{keys:userIds}]["userId", "firstName", "lastName", "email"]',
    get(pathSet) {
      const userProps = pathSet[2];
      const userIds = pathSet.userIds.map(userId => stringToUuid(userId));
      const userManagementService = this.getServiceClient(USER_MANAGEMENT_SERVICE);
      return userManagementService.getUserProfileAsync({ userIds })
        .then(response => {
          // Put profiles into a map keyed by user Id
          const profilesById = new Map();
          response.profiles.forEach(p => {
            profilesById.set(uuidToString(p.userId), p);
          });
          
          // Get an array of path values for each user id
          const pathValues = pathSet.userIds.map(userId => {
            // Did the service return a user with that id?
            let profile = profilesById.get(userId);
            if (!profile) {
              // Nope, just return an empty atom for the user id
              return [
                { path: [ 'usersById', userId ], value: $atom() }
              ];
            }
            
            // Yup, grab the props that were requested
            return userProps.map(prop => {
              let path = [ 'usersById', userId, prop ];
              switch (prop) {
                case 'userId':
                  return { path, value: userId };
                default:
                  return { path, value: profile[prop] };
              }
            });
          });
          
          // Flatten down to a single array of path values for all user ids
          return flattenPathValues(pathValues);
        })
        .catch(err => {
          logger.log('error', 'Error while getting user profiles', err);
          return pathSet.userIds.map(userId => {
            return { path: [ 'usersById', userId ], value: $error() };
          });
        });
    }
  },
  {
    // Log a user into the system
    route: 'currentUser.login',
    call(callPath, args) {
      throw new Error('Not implemented');
    }
  },
  {
    // Log a user out of the system
    route: 'currentUser.logout',
    call(callPath, args) {
      throw new Error('Not implemented');
    }
  },
  {
    // Register a new user
    route: 'currentUser.register',
    call(callPath, args) {
      throw new Error('Not implemented');
    }
  }
];

export default routes;