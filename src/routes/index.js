import { logRequests } from './decorators/log-requests';
import { logErrors } from './decorators/log-errors';

import commentsRoutes from './comments-routes';
import ratingsRoutes from './ratings-routes';
import sampleDataRoutes from './sample-data-routes';
import searchRoutes from './search-routes';
import statsRoutes from './stats-routes';
import suggestionsRoutes from './suggestions-routes';
import uploadsRoutes from './uploads-routes';
import userRoutes from './user-routes';
import videoRoutes from './video-routes';


// Combine all routes into a single array
const routes = [
  ...commentsRoutes,
  ...ratingsRoutes,
  ...sampleDataRoutes,
  ...searchRoutes,
  ...statsRoutes,
  ...suggestionsRoutes,
  ...uploadsRoutes,
  ...userRoutes,
  ...videoRoutes
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
export { routes };