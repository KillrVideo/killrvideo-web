import { pipe, prepend, append, prop, of as toArray } from 'ramda';
import uuid from 'uuid';
import { VIDEO_CATALOG_SERVICE, VideoLocationType } from '../services/video-catalog';
import { getServiceClientAsync } from '../services/factory';
import { uuidToString, stringToUuid, timestampToDateString, dateStringToTimestamp, enumToInteger } from '../utils/protobuf-conversions';
import { toAtom, toRef, toError } from './common/sentinels';
import { createPropPicker } from './common/props';
import * as Common from './common';
import { logger } from 'killrvideo-nodejs-common';

const videoPropsMap = {
  'tags': pipe(prop('tags'), toAtom),
  'videoId': pipe(prop('videoId'), uuidToString),
  'addedDate': pipe(prop('addedDate'), timestampToDateString),
  'locationType': pipe(prop('locationType'), enumToInteger(VideoLocationType)),
  'author': pipe(prop('userId'), uuidToString, toArray, prepend('usersById'), toRef),
  'stats': pipe(prop('videoId'), uuidToString, toArray, prepend('videosById'), append('stats'), toRef)
};

const pickVideoProps = createPropPicker(videoPropsMap);

// All routes supported by the video catalog service
const routes = [
  {
    // Basic video catalog data by video Id
    route: 'videosById[{keys:videoIds}]["videoId", "addedDate", "description", "location", "locationType", "name", "tags", "author"]',
    get: Common.serviceRequest(
      path => ({ videoId: stringToUuid(path[1]) }),
      VIDEO_CATALOG_SERVICE,
      (req, client) => { return client.getVideoAsync(req); },
      pickVideoProps
    )
  },
  {
    // Reference point for the recent videos list
    route: 'recentVideos',
    get: Common.listReference(
      path => ({ pageSize: 1 }),
      VIDEO_CATALOG_SERVICE,
      (req, client) => { return client.getLatestVideoPreviewsAsync(req); },
      [ 'videoId', 'addedDate' ], 
      pickVideoProps
    )
  },
  {
    // The recent videos list
    route: 'recentVideosList[{keys:startingVideoTokens}][{ranges:indexRanges}]["videoId", "name", "previewImageLocation", "addedDate", "author", "stats"]',
    get: Common.pagedServiceRequest(
      path => {
        let tokenParts = path[1].split('_');
        return {
          startingVideoId: stringToUuid(tokenParts[0]),
          startingAddedDate: dateStringToTimestamp(tokenParts[1])
        };
      },
      VIDEO_CATALOG_SERVICE,
      (req, client) => { return client.getLatestVideoPreviewsAsync(req); },
      pickVideoProps
    )
  },
  {
    // Reference point for list of videos by author (user) Id
    route: 'usersById[{keys:userIds}].videos',
    get: Common.listReference(
      path => ({ pageSize: 1, userId: stringToUuid(path[1]) }),
      VIDEO_CATALOG_SERVICE, 
      (req, client) => { return client.getUserVideoPreviewsAsync(req); },
      [ 'videoId', 'addedDate' ],
      pickVideoProps
    )
  },
  {
    // List of videos added by a particular user
    route: 'usersById[{keys:userIds}].videosList[{keys:startingVideoTokens}][{ranges:indexRanges}]["videoId", "name", "previewImageLocation", "addedDate", "author", "stats"]',
    get: Common.pagedServiceRequest(
      path => {
        let tokenParts = path[3].split('_');
        return {
          userId: stringToUuid(path[1]),
          startingVideoId: stringToUuid(tokenParts[0]),
          startingAddedDate: dateStringToTimestamp(tokenParts[1])
        };
      },
      VIDEO_CATALOG_SERVICE,
      (req, client) => { return client.getUserVideoPreviewsAsync(req); },
      pickVideoProps
    )
  },
  {
    // Submit a YouTube video to the catalog
    route: 'videosById.addYouTube',
    call(callPath, args) {
      const [ youTubeVideoId, name, description, tags ] = args;
      
      const errPath = [ 'videosById', 'addYouTubeErrors' ];
      
      // Make sure the user is logged in
      const userId = this.getCurrentUserId();
      if (userId === null) {
        return [
          { path: errPath, value: toError('Not currently logged in') }
        ];
      }
      
      // Create request
      let videoId = uuid.v4();
      let request = {
        videoId: stringToUuid(videoId),
        userId: stringToUuid(userId),
        name,
        description,
        tags,
        youTubeVideoId
      };
      
      // Do request
      return getServiceClientAsync(VIDEO_CATALOG_SERVICE)
        .then(client => client.submitYouTubeVideoAsync(request)) 
        .then(response => {
          // Since YouTube videos are available immediately, invalidate the recentVideos collection
          return [
            { path: [ 'usersById', userId, 'videos' ], invalidated: true },
            { path: [ 'recentVideos' ], invalidated: true },
            { path: [ 'videosById', videoId, 'videoId' ], value: videoId }
          ];
        })
        .catch(err => {
          logger.log('error', 'Error adding YouTube video', err);
          return [
            { path: errPath, value: toError(err.message) }
          ];
        });
    }
  },
  {
    // Submit an uploaded video to the catalog
    route: 'videosById.addUploaded',
    call(callPath, args) {
      const [ uploadUrl, name, description, tags ] = args;
      
      const errPath = [ 'videosById', 'addUploadedErrors' ];
      
      // Make sure the user is logged in
      const userId = this.getCurrentUserId();
      if (userId === null) {
        return [
          { path: errPath, value: toError('Not currently logged in') }
        ];
      }
      
      // Create request
      let videoId = uuid.v4();
      let request = {
        videoId: stringToUuid(videoId),
        userId: stringToUuid(userId),
        name,
        description,
        tags,
        uploadUrl
      };
      
      // Do the request
      return getServiceClientAsync(VIDEO_CATALOG_SERVICE)
        .then(client => client.submitUploadedVideoAsync(request)) 
        .then(response => {
          // Since uploaded videos won't be available immediately, we don't need to invalidate the
          // recentVideos collection yet
          return [
            { path: [ 'usersById', userId, 'videos' ], invalidated: true },
            { path: [ 'videosById', videoId, 'videoId' ], value: videoId }
          ];
        })
        .catch(err => {
          logger.log('error', 'Error adding Uploaded video', err);
          return [
            { path: errPath, value: toError(err.message) }
          ];
        });
    }
  }
];

export default routes;