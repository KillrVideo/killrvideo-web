import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import Promise from 'bluebird';
import { getClientAsync } from '../services/stats';
import { uuidToString, stringToUuid } from '../utils/protobuf-conversions';
import { logger } from '../utils/logging';

// Route definitions handled by the statistics service
const routes = [
  {
    // Number of views for a video by id
    route: 'statsByVideoId[{keys:videoIds}].views',
    get(pathSet) {
      // Convert string keys to uuids for protobuf request
      const videoIds = pathSet.videoIds.map(videoId => stringToUuid(videoId));
      
      // Make the request
      return getClientAsync()
        .then(client => client.getNumberOfPlaysAsync({ videoIds }))
        .then(response => {
          // Put stats into a map keyed by video id
          const statsById = new Map();
          response.stats.forEach(s => {
            statsById.set(uuidToString(s.videoId), s);
          });
          
          // Get a path value for each video Id
          return pathSet.videoIds.map(videoId => {
            // Did we get a stat for that video Id?
            let stat = statsById.get(videoId);
            if (!stat) {
              // Nope, just return an empty atom
              return { path: [ 'statsByVideoId', videoId ], value: $atom() };
            }
            
            // Yup, return the number of views
            return { path: [ 'statsByVideoId', videoId, 'views' ], value: stat.views };
          });
        })
        .catch(err => {
          logger.log('error', 'Error while getting video stats', err);
          return pathSet.videoIds.map(videoId => {
            return { path: [ 'statsByVideoId', videoId ], value: $error() };
          });
        });
    }
  },
  {
    // Record playback on a video
    route: 'statsByVideoId[{keys:videoIds}].recordPlayback',
    call(callPath, args) {
      // TODO: Need to make sure client follows refs to stats
      throw new Error('Not implemented');
    }
  }
];

export default routes;