import { _, isUndefined, pick } from 'lodash';
import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';

import getUsers from '../data/users';

// Some indexes
const usersIndexById = _(getUsers()).indexBy('userId').value();

// Route definitions
const routes = [
  {
    // Basic user information
    route: 'usersById[{keys:userIds}]["userId", "createdDate", "firstName", "lastName", "email"]',
    get(pathSet) {
      const userProps = pathSet[2];
      const usersById = _(pathSet.userIds)
        .reduce((acc, userId) => {
          let u = usersIndexById[userId];
          acc[userId] = isUndefined(u)
            ? $error('User not found')
            : pick(u, userProps);
            
          return acc;
        }, {});
      
      return { jsonGraph: { usersById } };
    }
  }
];

// Export the route definitions
export default routes;