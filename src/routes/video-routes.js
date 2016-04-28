import { VIDEO_CATALOG_SERVICE, VideoLocationType } from '../services/video-catalog';
import { uuidToString, stringToUuid, timestampToDateString, dateStringToTimestamp, enumToInteger } from '../utils/protobuf-conversions';
import { responsePicker, toAtom, toRef } from '../utils/falcor-conversions';
import { pipe, prepend, append, prop, of as toArray } from 'ramda';
import { createGetPipeline } from '../utils/falcor-pipeline';
import * as P from '../utils/pipeline-functions';

const videoPropsMap = {
  'tags': pipe(prop('tags'), toAtom),
  'videoId': pipe(prop('videoId'), uuidToString),
  'addedDate': pipe(prop('addedDate'), timestampToDateString),
  'locationType': pipe(prop('locationType'), enumToInteger(VideoLocationType)),
  'author': pipe(prop('userId'), uuidToString, toArray, prepend('usersById'), toRef),
  'stats': pipe(prop('videoId'), uuidToString, toArray, prepend('videosById'), append('stats'), toRef)
};

const pickVideoProps = responsePicker(videoPropsMap);

// All routes supported by the video catalog service
const routes = [
  {
    // Basic video catalog data by video Id
    route: 'videosById[{keys:videoIds}]["videoId", "addedDate", "description", "location", "locationType", "name", "tags", "author"]',
    get: createGetPipeline(
      P.createRequestsFromPaths(1, path => ({ videoId: stringToUuid(path[1]) })),
      P.doRequests(VIDEO_CATALOG_SERVICE, (req, client) => { return client.getVideoAsync(req); }),
      P.mapProps(2, pickVideoProps)
    )
  },
  {
    // Reference point for the recent videos list
    route: 'recentVideos',
    get: createGetPipeline(
      P.clearPagingStateCache(0),
      P.createRequestsFromPaths(0, path => ({ pageSize: 1 })),
      P.doRequests(VIDEO_CATALOG_SERVICE, (req, client) => { return client.getLatestVideoPreviewsAsync(req); }),
      P.mapResultsToTokenRefs('videoPreviews', [ 'videoId', 'addedDate' ], pickVideoProps)
    )
  },
  {
    // The recent videos list
    route: 'recentVideosList[{keys:startingVideoTokens}][{ranges:indexRanges}]["videoId", "name", "previewImageLocation", "addedDate", "author", "stats"]',
    get: createGetPipeline(
      P.createPagedRequestsFromPaths(2, path => {
        let tokenParts = path[1].split('_');
        return {
          startingVideoId: stringToUuid(tokenParts[0]),
          startingAddedDate: dateStringToTimestamp(tokenParts[1])
        };
      }),
      P.doRequests(VIDEO_CATALOG_SERVICE, (req, client) => { return client.getLatestVideoPreviewsAsync(req); }),
      // TODO: Pick props
      P.emptyResults()
    )
  },
  {
    // Reference point for list of videos by author (user) Id
    route: 'usersById[{keys:userIds}].videos',
    get: createGetPipeline(
      P.clearPagingStateCache(2),
      P.createRequestsFromPaths(2, path => ({ pageSize: 1, userId: stringToUuid(path[1]) })),
      P.doRequests(VIDEO_CATALOG_SERVICE, (req, client) => { return client.getUserVideoPreviewsAsync(req); }),
      P.mapResultsToTokenRefs('videoPreviews', [ 'videoId', 'addedDate' ], pickVideoProps)
    )
  },
  {
    // List of videos added by a particular user
    route: 'usersById[{keys:userIds}].videosList[{keys:startingVideoTokens}][{ranges:indexRanges}]["videoId", "name", "previewImageLocation", "addedDate", "author", "stats"]',
    get: createGetPipeline(
      P.createPagedRequestsFromPaths(4, path => {
        let tokenParts = path[3].split('_');
        return {
          userId: stringToUuid(path[1]),
          startingVideoId: stringToUuid(tokenParts[0]),
          startingAddedDate: dateStringToTimestamp(tokenParts[1])
        };
      }),
      P.doRequests(VIDEO_CATALOG_SERVICE, (req, client) => { return client.getUserVideoPreviewsAsync(req); }),
      // TODO: Pick props
      P.emptyResults()
    )
  },
  {
    // Submit a YouTube video to the catalog
    route: 'usersById[{keys:userIds}].videos.addYouTube',
    call(callPath, args) {
      // TODO: Add YouTube video
      throw new Error('Not implemented');
    }
  },
  {
    // Submit an uploaded video to the catalog
    route: 'usersById[{keys:userIds}].videos.addUploaded',
    call(callPath, args) {
      // TODO: Add Uploaded video
      throw new Error('Not implemented');
    }
  }
];

export default routes;