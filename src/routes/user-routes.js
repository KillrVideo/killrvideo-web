import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import { USER_MANAGEMENT_SERVICE } from '../services/user-management';
import { uuidToString, stringToUuid } from '../utils/protobuf-conversions';
import { responsePicker, isError } from '../utils/falcor-conversions';
import { pipe, prop, tap } from 'ramda';
import { createGetPipeline, createCallPipeline } from '../utils/falcor-pipeline';
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
      return { 
        jsonGraph: { currentUser: userId ? $ref([ 'usersById', userId ]) : $atom() } 
      };
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
    call: createCallPipeline(
      P.createRequestsFromArgs(args => ({ email: args[0], password: args[1] })),
      P.doRequests(USER_MANAGEMENT_SERVICE, (req, client) => client.verifyCredentialsAsync(req)),
      P.pipeRequestContext(requestContext => {
        // Log the user in if found
        let response = requestContext.results[0];
        if (response.userId) {
          // Set current user id is async to return a Promise that returns the original request context when finished
          return requestContext.router.setCurrentUserId(uuidToString(response.userId))
            .return(requestContext);
        }
        return requestContext;
      }),
      P.transformResults(results => {
        let response = results[0];
        if (isError(response)) {
          return [
            { path: [ 'currentUser' ], value: $error('Unexpected error. Try again later.') }
          ];
        }
        
        if (!response.userId) {
          return [
            { path: [ 'currentUser', 'loginErrors' ], value: $error('Invalid email address or password') }
          ];
        }
        
        return [
          { path: [ 'currentUser' ], value: $ref([ 'usersById', uuidToString(response.userId) ]) }
        ];
      })
    )
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
      throw new Error('Not implemented');
    }
  }
];

export default routes;