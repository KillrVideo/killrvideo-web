import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import Promise from 'bluebird';
import { getClientAsync } from '../services/stats';
import { uuidToString, stringToUuid } from '../utils/protobuf-conversions';
import { logger } from '../utils/logging';

// Routes handled by the ratings service
const routes = [
  {
    // Gets a videos ratings stats by video Id
    route: 'videosById[{keys:videoIds}].rating["count", "total"]',
    get(pathSet) {
      throw new Error('Not implemented');
    }
  },
  {
    // Gets the rating value a user gave to a video 
    route: 'usersById[{keys:userIds}].ratings[{keys:videoIds}].rating',
    get(pathSet) {
      throw new Error('Not implemented');
    }
  },
  {
    // Rates a video
    route: 'videosById[{keys:videoIds}].rating.rate',
    call(callPath, args) {
      // TODO: Need to update client to call .rating.rate instead of just .rate
      throw new Error('Not implemented');
    }
  }
];

export default routes;