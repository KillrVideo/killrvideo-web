import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import Promise from 'bluebird';
import { VIDEO_CATALOG_SERVICE, VideoLocationType } from '../services/video-catalog';
import { uuidToString, stringToUuid, timestampToDateString, dateStringToTimestamp, enumToInteger } from '../utils/protobuf-conversions';
import { flattenPathValues, explodePaths, toEmptyPathValue, getRequestPages, EMPTY_LIST_VALUE } from '../utils/falcor-utils';
import { responsePicker, getPathValuesFromResponse, toAtom, toRef, toArray } from '../utils/falcor-conversions';
import { pipe, prepend, append, prop, props, path, ifElse, isNil } from 'ramda';
import { logger } from '../utils/logging';
import { createGetPipeline } from '../utils/falcor-pipeline';
import { advanceToDepth, createRequests, doRequests, pickPropsFromResponses, clearPagingStateCache, createPagingToken } from '../utils/pipeline-functions';

const pickVideoProp = responsePicker({
  'tags': pipe(prop('tags'), toAtom),
  'videoId': pipe(prop('videoId'), uuidToString),
  'addedDate': pipe(prop('addedDate'), timestampToDateString),
  'locationType': pipe(prop('locationType'), enumToInteger(VideoLocationType)),
  'author': pipe(prop('userId'), uuidToString, toArray, prepend('usersById'), toRef),
  'stats': pipe(prop('videoId'), uuidToString, toArray, prepend('videosById'), append('stats'), toRef)
});

const mapToVideoById = getPathValuesFromResponse(pickVideoProp);

// All routes supported by the video catalog service
const routes = [
  {
    // Basic video catalog data by video Id
    route: 'videosById[{keys:videoIds}]["videoId", "addedDate", "description", "location", "locationType", "name", "tags", "author"]',
    get: createGetPipeline(
      advanceToDepth(1),
      createRequests(videoId => ({ videoId: stringToUuid(videoId) })),
      doRequests(VIDEO_CATALOG_SERVICE, (client, req) => { return client.getVideoAsync(req); }),
      pickPropsFromResponses(pickVideoProp)
    )
  },
  {
    // Reference point for the recent videos list
    route: 'recentVideos',
    get(pathSet) {
      // Reset any cached paging state
      this.pagingStateCache.clearKey('recentVideos');
      
      const videosService = this.getServiceClient(VIDEO_CATALOG_SERVICE);
      
      // Figure out the latest video so we can return a reference to a list that's stable for paging
      return videosService.getLatestVideoPreviewsAsync({ pageSize: 1 })
        .then(response => {
          let startingVideoToken = EMPTY_LIST_VALUE;
          if (response.videoPreviews.length === 1) {
            // Use video id and added date as token
            startingVideoToken = `${uuidToString(response.videoPreviews[0].videoId)}_${timestampToDateString(response.videoPreviews[0].addedDate)}`;
          }
          return [
            { path: [ 'recentVideos' ], value: $ref([ 'recentVideosList', startingVideoToken ]) }
          ];
        })
        .catch(err => {
          logger.log('error', 'Error while getting latest video preview', err);
          return [
            { path: [ 'recentVideos' ], value: $error() }
          ];
        });
    }
  },
  {
    // The recent videos list
    route: 'recentVideosList[{keys:startingVideoTokens}][{ranges:indexRanges}]["videoId", "name", "previewImageLocation", "addedDate", "author", "stats"]',
    get(pathSet) {
      // This should only ever get called with a single starting video token, so do a sanity check
      if (pathSet.startingVideoTokens.length != 1) {
        throw new Error('Requests should only ever have a single starting video token');
      }
      
      const startingVideoToken = pathSet.startingVideoTokens[0];
      
      // If list is empty, no need to go to service
      if (startingVideoToken === EMPTY_LIST_VALUE) {
        return explodePaths(pathSet, 2).map(toEmptyPathValue);
      }
      
      // Parse the token into video id and added date
      const tokenParts = startingVideoToken.split('_');
      const startingVideoId = stringToUuid(tokenParts[0]);
      const startingAddedDate = dateStringToTimestamp(tokenParts[1]);
      
      // The props to get for the videos
      const videoProps = pathSet[3];
      
      const videosService = this.getServiceClient(VIDEO_CATALOG_SERVICE);
      const request = { startingVideoId, startingAddedDate };
      
      const previewsPages = getRequestPages(pathSet.indexRanges, this.pagingStateCache, 'recentVideos');
      const getPreviewsPromises = previewsPages.map(page => {
        return page.doRequest(videosService.getLatestVideoPreviewsAsync, request)
          .then(response => { 
            const pathValues = page.mapResponse(response.videoPreviews, (preview, idx) => {
              if (preview === null) {
                return [ { path: [ 'recentVideosList', startingVideoToken, idx ], value: $atom() } ];
              }
              
              return videoProps.map(prop => {
                const path = [ 'recentVideosList', startingVideoToken, idx, prop ];
                const value = pickVideoProp(prop, preview);
                return { path, value };
              });
            });
            return flattenPathValues(pathValues);
          })
          .catch(err => {
            logger.log('error', 'Error while getting latest videos', err);
            return page.mapIndexes(idx => {
              return { path: [ 'recentVideosList', startingVideoToken, idx ], value: $error() }
            });
          });
      });
      
      return Promise.all(getPreviewsPromises).then(flattenPathValues);
    }
  },
  {
    // Reference point for list of videos by author (user) Id
    route: 'usersById[{keys:userIds}].videos',
    get(pathSet) {
      // Reset any cached paging state
      pathSet.userIds.forEach(userId => {
        this.pagingStateCache.clearKey(`userVideos_${userId}`);
      });
      
      const videosService = this.getServiceClient(VIDEO_CATALOG_SERVICE);
      
      // Figure out the latest video for each user so we can return a reference to a list that's stable for paging
      const getUserVideoPromises = pathSet.userIds.map(userId => {
        return videosService.getUserVideoPreviewsAsync({ pageSize: 1, userId: stringToUuid(userId) })
          .then(response => {
            let startingVideoToken = EMPTY_LIST_VALUE;
            if (response.videoPreviews.length === 1) {
              startingVideoToken = `${uuidToString(response.videoPreviews[0].videoId)}_${timestampToDateString(response.videoPreviews[0].addedDate)}`;
            }
            return { 
              path: [ 'usersById', userId, 'videos' ], 
              value: $ref([ 'userVideosList', userId, startingVideoToken ]) 
            };
          })
          .catch(err => {
            logger.log('error', 'Error while getting user latest video', err);
            return  { path: [ 'usersById', userId, 'videos' ], value: $error() };
          });
      });
      
      return Promise.all(getUserVideoPromises);
    }
  },
  {
    // List of videos added by a particular user
    route: 'userVideosList[{keys:userIds}][{keys:startingVideoTokens}][{ranges:indexRanges}]["videoId", "name", "previewImageLocation", "addedDate", "author"]',
    get(pathSet) {
      // TODO: User videos list
      throw new Error('Not implemented');
    }
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