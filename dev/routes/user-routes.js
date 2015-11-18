import { _, isUndefined, pick } from 'lodash';
import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import uuid from 'uuid';
import moment from 'moment';

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
    // The currently logged in user info
    route: 'currentUser.info',
    get(pathSet) {
      const userId = this.request.session.userId;
      if (isUndefined(userId)) {
        return [
          { path: [ 'currentUser' ], value: $atom(null) }
        ];
      }
      return [
        { path: [ 'currentUser', 'info' ], value: $ref([ 'usersById', userId ]) }
      ];
    }
  },
  {
    // User login
    route: 'currentUser.login',
    call(callPath, args) {
      // Try to find user with that username/password
      let [ email, password ] = args;
      let u = userCredentialsStore[email];
      let currentUser;
      if (!isUndefined(u) && u.password === password) {
        this.request.session.userId = u.userId;
        currentUser = [
          { path: [ 'currentUser', 'info' ], value: $ref([ 'usersById', u.userId ]) }
        ];
      } else {
        currentUser = [
          { path: [ 'currentUser', 'loginErrors' ], value: $error('Invalid email address or password') }
        ];
      }
      return currentUser;
    }
  },
  {
    // User logout
    route: 'currentUser.logout',
    call(callPath, args) {
      delete this.request.session.userId;
      return [
        { path: [ 'currentUser' ], value: $atom(null) }
      ];
    }
  },
  {
    // User registration
    route: 'currentUser.register',
    call(callPath, args) {
      let [ firstName, lastName, email, password ] = args;
      
      // See if user already exists w/ email
      let u = userCredentialsStore[email];
      if (isUndefined(u)) {
        // Store user and log them in
        let userId = uuid.v4();
        usersByIdStore[userId] = {
          userId,
          createdDate: moment().toISOString(),
          firstName,
          lastName,
          email
        };
        userCredentialsStore[email] = { userId, password };
        
        this.request.session.userId = userId;
        return [
          { path: [ 'currentUser', 'info' ], value: $ref([ 'usersById', userId ]) }
        ];
      }
      
      return [
        { path: [ 'currentUser', 'registerErrors' ], value: $error('A user with that email address already exists.') }
      ];
    }
  }
  
];

// Export the route definitions
export default routes;