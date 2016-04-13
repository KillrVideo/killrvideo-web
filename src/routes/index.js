import { logRequests } from './decorators/log-requests';
import { logErrors } from './decorators/log-errors';

import videoRoutes from './video-routes';
import userRoutes from './user-routes';
import statsRoutes from './stats-routes';
import ratingsRoutes from './ratings-routes';

// Combine all routes into a single array
const routes = [
  ...videoRoutes,
  ...userRoutes,
  ...statsRoutes,
  ...ratingsRoutes
];

// Wrap routes with decorators
routes.forEach(route => {
  // The string representing the route definition
  let routeDef = route.route;
  
  // Look for function on the route object (should be a 'get', 'call', 'set', etc.)
  Object.keys(route).forEach(prop => {
    if (typeof route[prop] === 'function') {
      // Wrap function with decorator functions
      let value = logRequests(logErrors(routeDef, route[prop]));
      Object.defineProperty(route, prop, { value });
    }
  });
});

export default routes;