import { _, isUndefined, range, pick } from 'lodash';
import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import moment from 'moment';
import uuid from 'uuid';

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

// An uploaded video that we can use as a placeholder for newly added upload videos
const sampleUpload = _(videosByIdStore).values().find(v => v.locationType === 1);

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
      const videoIdsByDate = _(videosByIdStore)
        .values()
        .select(v => v.location !== null)
        .sortByOrder(vid => moment(vid.addedDate).toDate(), 'desc')
        .pluck('videoId')
        .take(MAX_RECENT_VIDEOS)
        .value();
      
      let pathValues = [];
      pathSet.indicies.forEach(idx => {
        pathValues.push({
          path: [ 'recentVideos', idx ],
          value: idx < MAX_RECENT_VIDEOS ? $ref([ 'videosById', videoIdsByDate[idx] ]) : $atom()
        });
      });
      
      return pathValues;
    }
  },
  {
    // Videos by user id projection
    route: 'usersById[{keys:userIds}].videos[{integers:indicies}]',
    get(pathSet) {
      let pathValues = [];
      
      pathSet.userIds.forEach(userId => {
        let videosForUser = videosByUserIdStore[userId]; 
        if (isUndefined(videosForUser)) {
          videosForUser = [];
        }
        
        videosForUser = _(videosForUser)
          .sortByOrder([ v => moment(v.addedDate).toDate() ], [ 'desc' ])
          .value();
        
        pathSet.indicies.forEach(idx => {
          pathValues.push({
            path: [ 'usersById', userId, 'videos', idx ],
            value: idx < videosForUser.length ? $ref([ 'videosById', videosForUser[idx].videoId ]) : $atom()
          })
        });
      });
      
      return pathValues;
    }
  },
  {
    // Add YouTube video to the catalog
    route: 'usersById[{keys:userIds}].videos.addYouTube',
    call(callPath, args) {
      const [ youTubeVideoId, name, description, tags ] = args;
      
      let pathValues = [];
      
      // Get current user
      const userId = this.requestContext.getUserId();
      if (isUndefined(userId)) {
        pathValues.push({
          path: [ 'currentUser', 'videos', 'addYouTubeErrors' ],
          value: $error('Not currently logged in')
        });
        return pathValues;
      }
      
      // Create video object for local storage
      const videoId = uuid.v4();
      const newVideo = {
        videoId,
        addedDate: moment().toISOString(),
        name,
        description,
        tags,
        previewImageLocation: `//img.youtube.com/vi/${youTubeVideoId}/hqdefault.jpg`,
        location: youTubeVideoId,
        locationType: 0,
        author: userId
      };
      
      // Add to videos by id
      videosByIdStore[videoId] = newVideo;
      
      // Add to videos by user Id
      let videosForUser = videosByUserIdStore[userId];
      if (isUndefined(videosForUser)) {
        videosForUser = [];
        videosByUserIdStore[userId] = videosForUser;
      }
      videosForUser.push(newVideo);
      
      // Return
      pathValues.push({ path: [ 'usersById', userId, 'videos' ], invalidated: true });
      pathValues.push({ path: [ 'usersById', userId, 'videos', 0 ], value: $ref([ 'videosById', videoId ]) });
      pathValues.push({ path: [ 'videosById', videoId, 'videoId' ], value: videoId });
      pathValues.push({ path: [ 'recentVideos' ], invalidated: true });
      
      return pathValues;
    }
  },
  {
    // Add an Uploaded video to the catalog
    route: 'usersById[{keys:userIds}].videos.addUploaded',
    call(callPath, args) {
      const [ uploadUrl, name, description, tags ] = args;
      
      let pathValues = [];
      
      // Get current user
      const userId = this.requestContext.getUserId();
      if (isUndefined(userId)) {
        pathValues.push({
          path: [ 'currentUser', 'videos', 'addUploadedErrors' ],
          value: $error('Not currently logged in')
        });
        return pathValues;
      }
      
      // Create video object for local storage
      const videoId = uuid.v4();
      const newVideo = {
        videoId,
        addedDate: moment().toISOString(),
        name,
        description,
        tags,
        previewImageLocation: null,   // Values are initially null to simulate "processing" having to happen behind the scenes
        location: null,
        locationType: 1,
        author: userId
      };
      
      // Add to videos by id
      videosByIdStore[videoId] = newVideo;
      
      // Add to videos by user Id
      let videosForUser = videosByUserIdStore[userId];
      if (isUndefined(videosForUser)) {
        videosForUser = [];
        videosByUserIdStore[userId] = videosForUser;
      }
      videosForUser.push(newVideo);
      
      // Wait for 30 seconds, then fill the location entries with data to simulate "processing"
      setTimeout(() => {
        newVideo.previewImageLocation = sampleUpload.previewImageLocation;
        newVideo.location = sampleUpload.location;
      }, 30000);
      
      // Return
      pathValues.push({ path: [ 'usersById', userId, 'videos' ], invalidated: true });
      pathValues.push({ path: [ 'usersById', userId, 'videos', 0 ], value: $ref([ 'videosById', videoId ]) });
      pathValues.push({ path: [ 'videosById', videoId, 'videoId' ], value: videoId });
      pathValues.push({ path: [ 'recentVideos' ], invalidated: true });
      
      return pathValues;
    }
  }
];

// Export the routes for videos
export default routes;