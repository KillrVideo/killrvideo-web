import { STATS_SERVICE } from '../services/stats';
import { uuidToString, stringToUuid } from '../utils/protobuf-conversions';
import { defaultResponsePicker } from '../utils/falcor-conversions';
import { always } from 'ramda';
import { createGetPipeline } from '../utils/falcor-pipeline';
import * as P from '../utils/pipeline-functions';

// Route definitions handled by the statistics service
const routes = [
  {
    // Number of views for a video by id
    route: 'videosById[{keys:videoIds}].stats["views"]',
    get: createGetPipeline(
      P.createBatchRequestsFromPaths(2, always('videosById'), paths => ({ videoIds: paths.map(p => stringToUuid(p[1])) })),
      P.doRequests(STATS_SERVICE, (req, client) => { return client.getNumberOfPlaysAsync(req); }),
      P.matchBatchResponsesToPaths('stats', (path, stat) => path[1] === uuidToString(stat.videoId)),
      P.mapProps(3, defaultResponsePicker)
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