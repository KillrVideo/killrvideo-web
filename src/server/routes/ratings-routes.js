import { prop } from 'ramda';
import { RATINGS_SERVICE } from '../services/ratings';
import { uuidToString, stringToUuid } from '../utils/protobuf-conversions';
import { createPropPicker, defaultPropPicker } from './common/props';
import * as Common from './common';
import { logger } from 'killrvideo-nodejs-common';

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
    route: 'videosById[{keys:videoIds}].rate',
    call(callPath, args) {
      const [ rating ] = args;
      
      let pathValues = [];
      if (callPath.videoIds.length !== 1) {
        callPath.videoIds.forEach(videoId => {
          pathValues.push({
            path: [ 'videosById', videoId, 'rateErrors' ],
            value: $error('Cannot rate more than one video at a time.')
          });
        });
        return pathValues;
      }
            
      const videoId = callPath.videoIds[0];
      
      // Get current user
      const userId = this.getCurrentUserId();
      if (userId === null) {
        pathValues.push({
          path: [ 'videosById', videoId, 'rateErrors' ],
          value: $error('Not currently logged in')
        });
        return pathValues;
      }
      
      let request = {
        videoId: stringToUuid(videoId),
        userId: stringToUuid(userId),
        rating
      };
      
      let client = this.getServiceClient(RATINGS_SERVICE);
      return client.rateVideoAsync(request)
        .then(response => {
          return [
            { path: [ 'videosById', videoId, 'rating' ], invalidated: true },
            { path: [ 'usersById', userId, 'ratings', videoId, 'rating' ], value: rating }
          ];
        })
        .catch(err => {
          logger.log('error', 'Error while rating video', err);
          return [
            { path: [ 'videosById', videoId, 'rateErrors' ], value: $error(err.message) }
          ];
        });
    }
  }
];

export default routes;