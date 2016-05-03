import { prop } from 'ramda';
import { RATINGS_SERVICE } from '../services/ratings';
import { uuidToString, stringToUuid } from '../utils/protobuf-conversions';
import { createPropPicker, defaultPropPicker } from './common/props';
import * as Common from './common';

const ratingsMap = {
  'count': prop('ratingsCount'),
  'total': prop('ratingsTotal')
};

const pickRatingsProps = createPropPicker(ratingsMap);

// Routes handled by the ratings service
const routes = [
  {
    // Gets a videos ratings stats by video Id
    route: 'videosById[{keys:videoIds}].rating["count", "total"]',
    get: Common.serviceRequest(
      path => ({ videoId: stringToUuid(path[1]) }),
      RATINGS_SERVICE,
      (req, client) => { return client.getRatingAsync(req); },
      pickRatingsProps
    )
  },
  {
    // Gets the rating value a user gave to a video 
    route: 'usersById[{keys:userIds}].ratings[{keys:videoIds}]["rating"]',
    get: Common.serviceRequest(
      path => ({ videoId: stringToUuid(path[3]), userId: stringToUuid(path[1]) }),
      RATINGS_SERVICE,
      (req, client) => { return client.getUserRatingAsync(req); },
      defaultPropPicker
    )
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