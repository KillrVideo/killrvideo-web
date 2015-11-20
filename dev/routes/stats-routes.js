import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import { _, isUndefined } from 'lodash';

import { getIntFromPartOfUuid } from './util';
import getVideos from '../data/videos';

// Generate stats for initial sample videos based on the video id
const viewsByVideoIdStore = _(getVideos())
  .pluck('videoId')
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
    route: 'videosById[{keys:videoIds}].views',
    get(pathSet) {
      const videosById = _(pathSet.videoIds)
        .reduce((acc, videoId) => { 
          acc[videoId] = { views: $ref([ 'viewsByVideoId', videoId ]) };
          return acc;
        }, {});
      return { jsonGraph: { videosById } };
    }
  },
  {
    // Views by video
    route: 'viewsByVideoId[{keys:videoIds}]',
    get(pathSet) {
      const viewsByVideoId = _(pathSet.videoIds)
        .reduce((acc, videoId) => {
          let views = viewsByVideoIdStore[videoId];
          acc[videoId] = isUndefined(views) ? $atom(null) : views;
          return acc;
        }, {});
      return { jsonGraph: { viewsByVideoId } };
    }
  }
];

// Export the routes
export default routes;