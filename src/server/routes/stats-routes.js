import { STATS_SERVICE } from '../services/stats';
import { getServiceClientAsync } from '../services/factory';
import { uuidToString, stringToUuid } from '../utils/protobuf-conversions';
import { defaultPropPicker } from './common/props';
import { batchedServiceRequest } from './common/index';
import { logger } from '../utils/logging';

// Route definitions handled by the statistics service
const routes = [
  {
    // Number of views for a video by id
    route: 'videosById[{keys:videoIds}].stats["views"]',
    get: batchedServiceRequest(
      paths => ({ videoIds: paths.map(p => stringToUuid(p[1])) }),
      STATS_SERVICE,
      (req, client) => { return client.getNumberOfPlaysAsync(req); },
      (path, stat) => path[1] === uuidToString(stat.videoId),
      defaultPropPicker
    )
  },
  {
    // Record playback on a video
    route: 'videosById[{keys:videoIds}].recordPlayback',
    call(callPath, args) {
      let pathValues = [];
      if (callPath.videoIds.length !== 1) {
        callPath.videoIds.forEach(videoId => {
          pathValues.push({
            path: [ 'videosById', videoId, 'recordPlaybackErrors' ],
            value: $error('Cannot record playback for more than one video at a time.')
          });
        });
        return pathValues;
      }
      
      const videoId = callPath.videoIds[0];
      
      let request = { videoId: stringToUuid(videoId) };
      return getServiceClientAsync(STATS_SERVICE)
        .then(client => client.recordPlaybackStartedAsync(request)) 
        .then(response => {
          return [
            { path: [ 'videosById', videoId, 'stats', 'views' ], invalidated: true }
          ];
        })
        .catch(err => {
          logger.log('error', 'Error while recording video playback', err);
          return [
            { path: [ 'videosById', videoId, 'recordPlaybackErrors' ], value: $error(err.message) }
          ];
        });
    }
  }
];

export default routes;