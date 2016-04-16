import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import Promise from 'bluebird';
import { SUGGESTED_VIDEO_SERVICE } from '../services/suggested-video';
import { uuidToString, stringToUuid } from '../utils/protobuf-conversions';
import { flattenPathValues, getIndexesFromRanges, groupIndexesByPagingState } from '../utils/falcor-utils';
import { logger } from '../utils/logging';

// Routes served by the suggested video service
const routes = [
  {
    // Videos related to another video
    route: 'videosById[{keys:videoIds}].relatedVideos[{ranges:indexRanges}]["videoId", "addedDate", "name", "previewImageLocation", "author", "stats"]',
    get(pathSet) {
      throw new Error('Not implemented');
    }
  },
  {
    // Personalized suggestions for a particular user
    route: 'usersById[{keys:userIds}].recommendedVideos[{ranges:indexRanges}]["videoId", "addedDate", "name", "previewImageLocation", "author", "stats"]',
    get(pathSet) {
      // TODO: Can only see your own recommendations
      throw new Error('Not implemented');
    }
  }
];

export default routes;