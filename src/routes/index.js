import videoRoutes from './video-routes';
import userRoutes from './user-routes';
import statsRoutes from './stats-routes';

// Combine all routes into a single array
const routes = [
  ...videoRoutes,
  ...userRoutes,
  ...statsRoutes
];

export default routes;