import { SUGGESTED_VIDEO_SERVICE } from '../services/suggested-video';
import { uuidToString, stringToUuid, timestampToDateString } from '../utils/protobuf-conversions';
import { toRef } from './common/sentinels';
import { pipe, prepend, append, prop, of as toArray } from 'ramda';
import { createPropPicker } from './common/props';
import * as Common from './common';

const pickVideoProps = createPropPicker({
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
    get: Common.listReferenceWithDummyToken()
  },
  {
    // Videos related to another video
    route: 'videosById[{keys:videoIds}].relatedVideosList[{keys:startingTokens}][{ranges:indexRanges}]["videoId", "addedDate", "name", "previewImageLocation", "author", "stats"]',
    get: Common.pagedServiceRequest(
      path => ({ videoId: stringToUuid(path[1]) }),
      SUGGESTED_VIDEO_SERVICE, 
      (req, client) => { return client.getRelatedVideosAsync(req); },
      pickVideoProps
    )
  },
  {
    // Reference point for personalized suggestions
    route: 'usersById[{keys:userIds}].recommendedVideos',
    get: Common.listReferenceWithDummyToken()
  },
  {
    // Personalized suggestions for a particular user
    route: 'usersById[{keys:userIds}].recommendedVideosList[{keys:startingTokens}][{ranges:indexRanges}]["videoId", "addedDate", "name", "previewImageLocation", "author", "stats"]',
    get: Common.pagedServiceRequest(
      path => ({ userId: stringToUuid(path[1]) }),
      SUGGESTED_VIDEO_SERVICE,
      (req, client) => { return client.getSuggestedForUserAsync(req); },
      pickVideoProps
    )
  }
];

export default routes;