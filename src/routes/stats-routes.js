import { STATS_SERVICE } from '../services/stats';
import { uuidToString, stringToUuid } from '../utils/protobuf-conversions';
import { defaultResponsePicker } from '../utils/falcor-conversions';
import { createGetPipeline } from '../utils/falcor-pipeline';
import * as P from '../utils/pipeline-functions';

// Route definitions handled by the statistics service
const routes = [
  {
    // Number of views for a video by id
    route: 'videosById[{keys:videoIds}].stats["views"]',
    get: createGetPipeline(
      P.createRequestFromAllPaths(2, allPaths => ({ videoIds: allPaths.map(path => stringToUuid(path[1])) })),
      P.doRequests(STATS_SERVICE, (req, client) => { return client.getNumberOfPlaysAsync(req); }),
      P.matchResponseListToPaths(2, 'stats', (path, stat) => path[1] === uuidToString(stat.videoId)),
      P.mapResponses(3, defaultResponsePicker),
      P.zipPathsAndResultsToJsonGraph(2)
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