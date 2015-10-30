import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import { _, isUndefined, pick } from 'lodash';

import getVideos from '../data/videos';

// Generate ratings for initial sample videos based on the video id
const ratingsByVideoIdStore = _(getVideos())
  .pluck('videoId')
  .reduce((acc, videoId) => {
    // Use last 5 "digits" of video id as the number of 1...5 star ratings where each "digit" is the number of ratings for a given  
    // star level (i.e. the last "digit" is the number of 5 star ratings, second to last is number of 4 star ratings, etc)
    let last5 = videoId.substr(videoId.length - 6, 5).split('');
    let rating = _(last5).reduce((ratingAcc, val, idx) => {
      var count = parseInt('0x' + val);
      var total = (idx + 1) * count;
      ratingAcc.count += count;
      ratingAcc.total += total;
      return ratingAcc;
    }, { count: 0, total: 0 });
    
    acc[videoId] = rating;
    return acc;
  }, {});

/**
 * Route definitions for video ratings.
 */
const routes = [
  {
    // Ratings by video
    route: 'ratingsByVideoId[{keys:videoIds}]["count", "total"]',
    get(pathSet) {
      const ratingsProps = pathSet[2];
      const ratingsByVideoId = _(pathSet.videoIds)
        .reduce((acc, videoId) => {
          let ratings = ratingsByVideoIdStore[videoId];
          acc[videoId] = isUndefined(ratings) ? $atom(null) : pick(ratings, ratingsProps);
          return acc;
        }, {});
      return { jsonGraph: { ratingsByVideoId } };
    }
  }
];

// Export the routes
export default routes;