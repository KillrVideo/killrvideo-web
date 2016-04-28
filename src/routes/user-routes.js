import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import uuid from 'uuid';
import { USER_MANAGEMENT_SERVICE } from '../services/user-management';
import { uuidToString, stringToUuid } from '../utils/protobuf-conversions';
import { responsePicker, isError } from '../utils/falcor-conversions';
import { pipe, prop, tap, always } from 'ramda';
import { createGetPipeline, createCallPipeline } from '../utils/falcor-pipeline';
import * as P from '../utils/pipeline-functions';

const userMap = {
  'userId': pipe(prop('userId'), uuidToString)
};

const pickUserProps = responsePicker(userMap);

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
      P.createBatchRequestsFromPaths(1, always('usersById'), paths => ({ userIds: paths.map(path => stringToUuid(path[1])) })),
      P.doRequests(USER_MANAGEMENT_SERVICE, (req, client) => { return client.getUserProfileAsync(req); }),
      P.matchBatchResponsesToPaths('profiles', (path, profile) => path[1] === uuidToString(profile.userId)),
      P.mapProps(2, pickUserProps)
    )
  },
  {
    // Log a user into the system
    route: 'currentUser.login',
    call: createCallPipeline(
      P.createRequestsFromArgs(args => ({ email: args[0], password: args[1] })),
      P.doRequests(USER_MANAGEMENT_SERVICE, (req, client) => client.verifyCredentialsAsync(req)),
      reqCtx => {
        // Log the user in if found
        let response = reqCtx.results[0];
        if (response.userId) {
          // Set current user id is async to return a Promise that returns the original request context when finished
          return reqCtx.router.setCurrentUserId(uuidToString(response.userId))
            .return(reqCtx);
        }
        return reqCtx;
      },
      P.setResultsBy(reqCtx => {
        let response = reqCtx.results[0];
        if (isError(response)) {
          return [
            { path: [ 'currentUser', 'loginErrors' ], value: response }
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
    call: createCallPipeline(
      P.addArg(uuid.v4()),
      P.createRequestsFromArgs(args => ({
        firstName: args[0],
        lastName: args[1],
        email: args[2], 
        password: args[3],
        userId: stringToUuid(args[4])
      })),
      P.doRequests(USER_MANAGEMENT_SERVICE, (req, client) => client.createUserAsync(req)),
      reqCtx => {
        let response = reqCtx.results[0];
        if (!isError(response)) {
          return reqCtx.router.setCurrentUserId(reqCtx.args[4])
            .return(reqCtx);
        }
        return reqCtx;
      },
      P.setResultsBy(reqCtx => {
        let response = reqCtx.results[0];
        if (isError(response)) {
          return [
            { path: [ 'currentUser', 'registerErrors' ], value: response }
          ];
        }
        
        return [
          { path: [ 'currentUser' ], value: $ref([ 'usersById', reqCtx.args[4] ])}
        ];
      })
    )
  }
];

export default routes;