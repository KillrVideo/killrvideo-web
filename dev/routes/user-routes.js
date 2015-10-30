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
    route: 'currentUser',
    get(pathSet) {
      const userId = this.userContext.getCurrentUserId();
      const currentUser = isUndefined(userId)
        ? $atom(null)
        : $ref([ 'usersById', userId ]);
      
      return { jsonGraph: { currentUser } };
    }
  },
  {
    // User login
    route: 'currentUser.login',
    call(callPath, args) {
      
    }
  },
  {
    // User logout
    route: 'currentUser.logout',
    call(callPath, args) {
      
    }
  }
  
];

// Export the route definitions
export default routes;