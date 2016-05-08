import { createPagedActions } from './paged';

/**
 * Public action creators 
 */

export const recentVideos = createPagedActions(state => state.home.recentVideos);
recentVideos.load = function(queries) {
  return recentVideos.getInitialPage([ 'recentVideos' ], queries);
};

export const recommendedVideos = createPagedActions(state => state.home.recommendedVideos);
recommendedVideos.load = function(queries) {
  return recommendedVideos.getInitialPage([ 'currentUser', 'recommendedVideos' ], queries);
};

export const myVideos = createPagedActions(state => state.home.myVideos);
myVideos.load = function(queries) {
  return myVideos.getInitialPage([ 'currentUser', 'videos' ], queries);
};