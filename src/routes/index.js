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

export default routes;