import videoRoutes from './video-routes';
import userRoutes from './user-routes';

// Combine all routes into a single array
const routes = [
  ...videoRoutes,
  ...userRoutes
];

export default routes;