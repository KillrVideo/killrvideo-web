import { STATS_SERVICE } from '../services/stats';
import { uuidToString, stringToUuid } from '../utils/protobuf-conversions';
import { defaultPropPicker } from './common/props';
import * as Common from './common';

// Route definitions handled by the statistics service
const routes = [
  {
    // Number of views for a video by id
    route: 'videosById[{keys:videoIds}].stats["views"]',
    get: Common.batchedServiceRequest(
      paths => ({ videoIds: paths.map(p => stringToUuid(p[1])) }),
      STATS_SERVICE,
      (req, client) => { return client.getNumberOfPlaysAsync(req); },
      (path, stat) => path[1] === uuidToString(stat.videoId),
      defaultPropPicker
    )
  },
  {
    // Record playback on a video
    route: 'videosById[{keys:videoIds}].stats.recordPlayback',
    call(callPath, args) {
      // TODO: Need to update client to call .stats.recordPlayback not just .recordPlayback
      throw new Error('Not implemented');
    }
  }
];

export default routes;