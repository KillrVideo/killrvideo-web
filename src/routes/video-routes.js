import { VIDEO_CATALOG_SERVICE, VideoLocationType } from '../services/video-catalog';
import { uuidToString, stringToUuid, timestampToDateString, dateStringToTimestamp, enumToInteger } from '../utils/protobuf-conversions';
import { responsePicker, toAtom, toRef } from '../utils/falcor-conversions';
import { pipe, prepend, append, prop, of as toArray } from 'ramda';
import { createGetPipeline } from '../utils/falcor-pipeline';
import { createRequestsFromPaths, doRequests, mapResponses, zipPathsAndResultsToJsonGraph, clearPagingStateCache, mapResponsesToTokenRefs, createPagedRequestsFromPaths, doPagedRequests } from '../utils/pipeline-functions';

const pickVideoProps = responsePicker({
  'tags': pipe(prop('tags'), toAtom),
  'videoId': pipe(prop('videoId'), uuidToString),
  'addedDate': pipe(prop('addedDate'), timestampToDateString),
  'locationType': pipe(prop('locationType'), enumToInteger(VideoLocationType)),
  'author': pipe(prop('userId'), uuidToString, toArray, prepend('usersById'), toRef),
  'stats': pipe(prop('videoId'), uuidToString, toArray, prepend('videosById'), append('stats'), toRef)
});

// All routes supported by the video catalog service
const routes = [
  {
    // Basic video catalog data by video Id
    route: 'videosById[{keys:videoIds}]["videoId", "addedDate", "description", "location", "locationType", "name", "tags", "author"]',
    get: createGetPipeline(
      createRequestsFromPaths(1, path => ({ videoId: stringToUuid(path[1]) })),
      doRequests(VIDEO_CATALOG_SERVICE, (req, client) => { return client.getVideoAsync(req); }),
      mapResponses(2, pickVideoProps),
      zipPathsAndResultsToJsonGraph(1)
    )
  },
  {
    // Reference point for the recent videos list
    route: 'recentVideos',
    get: createGetPipeline(
      clearPagingStateCache(0),
      createRequestsFromPaths(0, path => ({ pageSize: 1 })),
      doRequests(VIDEO_CATALOG_SERVICE, (req, client) => { return client.getLatestVideoPreviewsAsync(req); }),
      mapResponsesToTokenRefs(0, 'videoPreviews', [ 'videoId', 'addedDate' ], pickVideoProps),
      zipPathsAndResultsToJsonGraph(0)
    )
  },
  {
    // The recent videos list
    route: 'recentVideosList[{keys:startingVideoTokens}][{ranges:indexRanges}]["videoId", "name", "previewImageLocation", "addedDate", "author", "stats"]',
    get: createGetPipeline(
      createPagedRequestsFromPaths(2, path => {
        let tokenParts = path[1].split('_');
        return {
          startingVideoId: stringToUuid(tokenParts[0]),
          startingAddedDate: dateStringToTimestamp(tokenParts[1])
        };
      }),
      doPagedRequests(VIDEO_CATALOG_SERVICE, (req, client) => { return client.getLatestVideoPreviewsAsync(req); }, 'videoPreviews'),
      mapResponses(3, pickVideoProps),
      zipPathsAndResultsToJsonGraph(2)
    )
  },
  {
    // Reference point for list of videos by author (user) Id
    route: 'usersById[{keys:userIds}].videos',
    get: createGetPipeline(
      clearPagingStateCache(2),
      createRequestsFromPaths(2, path => ({ pageSize: 1, userId: stringToUuid(path[1]) })),
      doRequests(VIDEO_CATALOG_SERVICE, (req, client) => { return client.getUserVideoPreviewsAsync(req); }),
      mapResponsesToTokenRefs(2, 'videoPreviews', [ 'videoId', 'addedDate' ], pickVideoProps),
      zipPathsAndResultsToJsonGraph(2)
    )
  },
  {
    // List of videos added by a particular user
    route: 'usersById[{keys:userIds}].videosList[{keys:startingVideoTokens}][{ranges:indexRanges}]["videoId", "name", "previewImageLocation", "addedDate", "author"]',
    get: createGetPipeline(
      createPagedRequestsFromPaths(4, path => {
        let tokenParts = path[3].split('_');
        return {
          userId: stringToUuid(path[1]),
          startingVideoId: stringToUuid(tokenParts[0]),
          startingAddedDate: dateStringToTimestamp(tokenParts[1])
        };
      }),
      doPagedRequests(VIDEO_CATALOG_SERVICE, (req, client) => { return client.getUserVideoPreviewsAsync(req); }, 'videoPreviews'),
      mapResponses(5, pickVideoProps),
      zipPathsAndResultsToJsonGraph(4)
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