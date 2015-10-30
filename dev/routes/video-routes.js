import { _, isUndefined, range, pick } from 'lodash';
import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import moment from 'moment';

import { getIntFromPartOfUuid } from './util';
import getVideos from '../data/videos';
import getUsers from '../data/users';



// Array of all initial user ids
const userIds = _(getUsers()).pluck('userId').value();

// Create an index of the data
const videosIndexById = _(getVideos()).indexBy('videoId').mapValues(video => {
  // Use the video id to generate an index in the collection of sample users and add to the video
  var authorIdx = getIntFromPartOfUuid(video.videoId, 0, 1, userIds.length);
  video.author = userIds[authorIdx];
  return video;
}).value();

/**
 * Route definitions for videos
 */
const routes = [
  {
    // Basic video catalog data
    route: 'videosById[{keys:videoIds}]["videoId", "addedDate", "description", "location", "locationType", "name", "previewImageLocation", "tags", "author"]',
    get(pathSet) {
      const videoProps = pathSet[2];
      const videosById = _(pathSet.videoIds)
        .reduce((acc, videoId) => {
          let v = videosIndexById[videoId];
          if (isUndefined(v)) {
            v = $error('Video not found');
          } else {
            // Pick out the properties requested
            v = pick(v, videoProps);
            if (v.tags) v.tags = $atom(v.tags); // Tags are meant to be retrieved together so wrap in an atom
            if (v.author) v.author = $ref([ 'usersById', v.author ]);  // Author should be a reference to users by id
          }
          acc[videoId] = v; 
          return acc;
        }, {});
      
      return { jsonGraph: { videosById } };
    }
  },
  {
    // Recent videos projection
    route: 'recentVideos[{ranges:indexRanges}]',
    get(pathSet) {
      const MAX_RECENT_VIDEOS = 9;
      
      // Figure out the most recent video ids
      const videoIdsByDate = _(getVideos())
        .sortByOrder(vid => moment(vid.addedDate).toDate(), 'desc')
        .pluck('videoId')
        .take(MAX_RECENT_VIDEOS)
        .value();
        
      // Return as references to the videos by id collection
      const recentVideos = _(pathSet.indexRanges)
        .reduce((acc, idxRange) => {
          // Process each index in the range
          range(idxRange.from, idxRange.to + 1).forEach(idx => {
            acc[idx] = idx < MAX_RECENT_VIDEOS
              ? $ref([ 'videosById', videoIdsByDate[idx] ])
              : $atom();
          });
          return acc;
        }, {});
      
      return { jsonGraph: { recentVideos } };
    }
  },
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
    // Ratings data is handled by ratings routes
    route: 'videosById[{keys:videoIds}].rating',
    get(pathSet) {
      const videosById = _(pathSet.videoIds)
        .reduce((acc, videoId) => {
          acc[videoId] = { rating: $ref([ 'ratingsByVideoId', videoId ]) };
          return acc;
        }, {});
      return { jsonGraph: { videosById } };
    }
  },
  {
    // Comment data is handled by the comments routes
    route: 'videosById[{keys:videoIds}].comments',
    get(pathSet) {
      const videosById = _(pathSet.videoIds)
        .reduce((acc, videoId) => {
          acc[videoId] = { comments: $ref(['commentsByVideoId', videoId ]) };
          return acc;
        }, {});
      return { jsonGraph: { videosById } };
    }
  }
];

// Export the routes for videos
export default routes;