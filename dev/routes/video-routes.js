import { _, isUndefined, range, pick } from 'lodash';
import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import moment from 'moment';

import { getIntFromPartOfUuid } from './util';
import getVideos from '../data/videos';
import getUsers from '../data/users';



// Array of all initial user ids
const userIds = _(getUsers()).pluck('userId').value();

// Create an index of the data
const videosByIdStore = _(getVideos()).indexBy('videoId').mapValues(video => {
  // Use the video id to generate an index in the collection of sample users and add to the video
  var authorIdx = getIntFromPartOfUuid(video.videoId, 0, 2, userIds.length);
  video.author = userIds[authorIdx];
  return video;
}).value();

// Index also by user (author) id
const videosByUserIdStore = _(videosByIdStore).groupBy(v => v.author).value();

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
          let v = videosByIdStore[videoId];
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
    route: 'recentVideos[{integers:indicies}]',
    get(pathSet) {
      const MAX_RECENT_VIDEOS = 9;
      
      // Figure out the most recent video ids
      const videoIdsByDate = _(getVideos())
        .sortByOrder(vid => moment(vid.addedDate).toDate(), 'desc')
        .pluck('videoId')
        .take(MAX_RECENT_VIDEOS)
        .value();
      
      let pathValues = [];
      pathSet.indicies.forEach(idx => {
        pathValues.push({
          path: [ 'recentVideos', idx ],
          value: idx < MAX_RECENT_VIDEOS ? $ref([ 'videosById', videoIdsByDate[idx] ]) : null
        });
      })
      
      return pathValues;
    }
  },
  {
    // Suggested videos projection
    route: 'currentUser.suggestedVideos[{integers:indicies}]',
    get(pathSet) {
      const MAX_SUGGESTED_VIDEOS = 5;
      
      // Make sure a user is logged in
      const userId = this.requestContext.getUserId();
      if (isUndefined(userId)) {
        return [ 
          { path: ['currentUser', 'suggestedVideos'], value: $error('No user currently logged in.') }
        ];
      }
      
      // Use the user id to generate a start index in the videos array
      const videos = getVideos();
      const startIdx = getIntFromPartOfUuid(userId, 0, 2, videos.length);
      const suggestedVideos = _(videos).pluck('videoId').slice(startIdx).take(MAX_SUGGESTED_VIDEOS).value();
      
      let pathValues = [];
      pathSet.indicies.forEach(idx => {
        pathValues.push({
          path: [ 'currentUser', 'suggestedVideos', idx ],
          value: idx < suggestedVideos.length ? $ref([ 'videosById', suggestedVideos[idx] ]) : $atom(null)
        });
      });
      
      return pathValues;
    }
  },
  {
    // My videos video projection
    route: 'currentUser.myVideos',
    get(pathSet) {
      // Make sure a user is logged in
      const userId = this.requestContext.getUserId();
      if (isUndefined(userId)) {
        return [ 
          { path: [ 'currentUser', 'myVideos' ], value: $error('No user currently logged in.') }
        ];
      }
      
      return [
        { path: [ 'currentUser', 'myVideos' ], value: $ref([ 'videosByUserId', userId ]) }
      ];
    }
  },
  {
    // Videos by user id projection
    route: 'videosByUserId[{keys:userIds}][{integers:indicies}]',
    get(pathSet) {
      let pathValues = [];
      
      pathSet.userIds.forEach(userId => {
        let videosForUser = videosByUserIdStore[userId]; 
        if (isUndefined(videosForUser)) {
          pathValues.push({ path: [ 'videosByUserId', userId ], value: $atom(null) })
        } else {
          pathSet.indicies.forEach(idx => {
            pathValues.push({
              path: [ 'videosByUserId', userId, idx ],
              value: idx >= videosForUser.length ? $atom(null) : $ref([ 'videosById', videosForUser[idx].videoId ])
            })
          });
        }
      });
      
      return pathValues;
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
  }
];

// Export the routes for videos
export default routes;