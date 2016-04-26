import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import { USER_MANAGEMENT_SERVICE } from '../services/user-management';
import { uuidToString, stringToUuid } from '../utils/protobuf-conversions';
import { responsePicker } from '../utils/falcor-conversions';
import { pipe, prop } from 'ramda';
import { createGetPipeline } from '../utils/falcor-pipeline';
import * as P from '../utils/pipeline-functions';

const pickUserProps = responsePicker({
  'userId': pipe(prop('userId'), uuidToString)
});

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
    get: createGetPipeline(
      P.createRequestFromAllPaths(1, allPaths => ({ userIds: allPaths.map(path => stringToUuid(path[1])) })),
      P.doRequests(USER_MANAGEMENT_SERVICE, (req, client) => { return client.getUserProfileAsync(req); }),
      P.matchResponseListToPaths(1, 'profiles', (path, profile) => path[1] === uuidToString(profile.userId)),
      P.mapResponses(2, pickUserProps),
      P.zipPathsAndResultsToJsonGraph(1)
    )
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