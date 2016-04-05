import videoRoutes from './video-routes';
import userRoutes from './user-routes';
import commentRoutes from './comment-routes';
import ratingRoutes from './rating-routes';
import statsRoutes from './stats-routes';
import suggestionsRoutes from './suggestions-routes';
import searchRoutes from './search-routes';
import configRoutes from './configuration-routes';
import uploadRoutes from './upload-routes';
import chatRoutes from './chat-routes';

// All routes
const routes = [
  ...videoRoutes,
  ...userRoutes,
  ...commentRoutes,
  ...ratingRoutes,
  ...statsRoutes,
  ...suggestionsRoutes,
  ...searchRoutes,
  ...configRoutes,
  ...uploadRoutes,
  ...chatRoutes
];

// Export all available mock routes
export default routes;