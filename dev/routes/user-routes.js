import { _, isUndefined, pick } from 'lodash';
import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';

import getUsers from '../data/users';

// Some stores
const usersByIdStore = _(getUsers()).indexBy('userId').value();
const userCredentialsStore = _(getUsers())
  .indexBy('email')
  .mapValues(u => _(u).pick('userId').merge({ password: 'password' }).value())
  .value();

// Route definitions
const routes = [
  {
    // Basic user information
    route: 'usersById[{keys:userIds}]["userId", "createdDate", "firstName", "lastName", "email"]',
    get(pathSet) {
      const userProps = pathSet[2];
      const usersById = _(pathSet.userIds)
        .reduce((acc, userId) => {
          let u = usersByIdStore[userId];
          acc[userId] = isUndefined(u)
            ? $error('User not found')
            : pick(u, userProps);
            
          return acc;
        }, {});
      
      return { jsonGraph: { usersById } };
    }
  },
  {
    // The currently logged in user
    route: 'authentication.currentUser',
    get(pathSet) {
      const userId = this.userContext.getCurrentUserId();
      const currentUser = isUndefined(userId)
        ? $atom(null)
        : $ref([ 'usersById', userId ]);
      
      return [
        { path: [ 'authentication', 'currentUser' ], value: currentUser }
      ];
    }
  },
  {
    // User login
    route: 'authentication.login',
    call(callPath, args) {
      // Try to find user with that username/password
      let [ email, password ] = args;
      let u = userCredentialsStore[email];
      let currentUser;
      if (!isUndefined(u) && u.password === password) {
        this.userContext.setCurrentUserId(u.userId);
        currentUser = [
          { path: [ 'authentication', 'currentUser' ], value: $ref([ 'usersById', u.userId ]) }
        ];
      } else {
        currentUser = [
          { path: [ 'authentication', 'loginErrors' ], value: $error('Invalid email address or password') }
        ];
      }
      return currentUser;
    }
  },
  {
    // User logout
    route: 'authentication.logout',
    call(callPath, args) {
      this.userContext.clearCurrentUserId();
      return [
        { path: [ 'authentication', 'currentUser' ], value: $atom(null) }
      ];
    }
  }
  
];

// Export the route definitions
export default routes;