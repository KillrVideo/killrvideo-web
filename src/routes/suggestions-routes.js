import { SUGGESTED_VIDEO_SERVICE } from '../services/suggested-video';
import { uuidToString, stringToUuid, timestampToDateString } from '../utils/protobuf-conversions';
import { responsePicker, toRef } from '../utils/falcor-conversions';
import { pipe, prepend, append, prop, of as toArray } from 'ramda';
import { createGetPipeline } from '../utils/falcor-pipeline';
import * as P from '../utils/pipeline-functions';

const pickVideoProps = responsePicker({
  'videoId': pipe(prop('videoId'), uuidToString),
  'addedDate': pipe(prop('addedDate'), timestampToDateString),
  'author': pipe(prop('userId'), uuidToString, toArray, prepend('usersById'), toRef),
  'stats': pipe(prop('videoId'), uuidToString, toArray, prepend('videosById'), append('stats'), toRef)
});

// Routes served by the suggested video service
const routes = [
  {
    // Reference point for videos related to another video
    route: 'videosById[{keys:videoIds}].relatedVideos',
    get: createGetPipeline(
      P.clearPagingStateCache(2),
      P.mapPathsToNoTokenRefs(2)
    )
  },
  {
    // Videos related to another video
    route: 'videosById[{keys:videoIds}].relatedVideosList[{keys:startingTokens}][{ranges:indexRanges}]["videoId", "addedDate", "name", "previewImageLocation", "author", "stats"]',
    get: createGetPipeline(
      P.createPagedRequestsFromPaths(4, path => ({ videoId: stringToUuid(path[1]) })),
      P.doRequests(SUGGESTED_VIDEO_SERVICE, (req, client) => { return client.getRelatedVideosAsync(req); }),
      // TODO: Map props
      P.emptyResults()
    )
  },
  {
    // Reference point for personalized suggestions
    route: 'usersById[{keys:userIds}].recommendedVideos',
    get: createGetPipeline(
      P.clearPagingStateCache(2),
      P.mapPathsToNoTokenRefs(2)
    )
  },
  {
    // Personalized suggestions for a particular user
    route: 'usersById[{keys:userIds}].recommendedVideosList[{keys:startingTokens}][{ranges:indexRanges}]["videoId", "addedDate", "name", "previewImageLocation", "author", "stats"]',
    get: createGetPipeline(
      P.createPagedRequestsFromPaths(4, path => ({ userId: stringToUuid(path[1]) })),
      P.doRequests(SUGGESTED_VIDEO_SERVICE, (req, client) => { return client.getSuggestedForUserAsync(req); }),
      // TODO: Map props
      P.emptyResults()
    )
  }
];

export default routes;