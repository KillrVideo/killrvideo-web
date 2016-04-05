import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import { _, isUndefined } from 'lodash';

import { getIntFromPartOfUuid } from './util';
import getVideos from '../data/videos';

// Generate stats for initial sample videos based on the video id
const viewsByVideoIdStore = _(getVideos())
  .map('videoId')
  .reduce((acc, videoId) => {
    acc[videoId] = getIntFromPartOfUuid(videoId, videoId.length - 11, 10, 10000);
    return acc;
  }, {});

/**
 * Route definitions for video stats.
 */
const routes = [
  {
    // Views data is handled by stats routes
    route: 'videosById[{keys:videoIds}].stats["views"]',
    get(pathSet) {
      let pathValues = [];
      
      pathSet.videoIds.forEach(videoId => {
        const views = viewsByVideoIdStore[videoId];
        pathValues.push({
          path: [ 'videosById', videoId, 'stats', 'views' ],
          value: isUndefined(views) ? 0 : views
        });
      });
            
      return pathValues;
    }
  },
  {
    // Record video playback stats
    route: 'videosById[{keys:videoIds}].recordPlayback',
    call(callPath, args) {
      let pathValues = [];
      
      callPath.videoIds.forEach(videoId => {
        if (isUndefined(viewsByVideoIdStore[videoId])){
          viewsByVideoIdStore[videoId] = 0;
        }
        
        viewsByVideoIdStore[videoId] += 1;
        
        pathValues.push({
          path: [ 'videosById', videoId, 'stats', 'views' ],
          invalidated: true
        });
      });
      
      return pathValues;
    }
  }
];

// Export the routes
export default routes;