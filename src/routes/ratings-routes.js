import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import Promise from 'bluebird';
import { RATINGS_SERVICE } from '../services/ratings';
import { uuidToString, stringToUuid } from '../utils/protobuf-conversions';
import { flattenPathValues } from '../utils/falcor-utils';
import { logger } from '../utils/logging';

// Routes handled by the ratings service
const routes = [
  {
    // Gets a videos ratings stats by video Id
    route: 'videosById[{keys:videoIds}].rating["count", "total"]',
    get(pathSet) {
      const ratingsProps = pathSet[3];
      const ratingsService = this.getServiceClient(RATINGS_SERVICE);
      
      const getRatingsPromises = pathSet.videoIds.map(videoId => {
        // Get the ratings for each video Id from the ratings service
        return ratingsService.getRatingAsync({ videoId: stringToUuid(videoId) })
          .then(response => {
            // Pull properties from response
            return ratingsProps.map(prop => {
              let path = [ 'videosById', videoId, 'rating', prop ];
              switch(prop) {
                case 'count':
                  return { path, value: response.ratingsCount };
                case 'total':
                  return { path, value: response.ratingsTotal };
                default:
                  throw new Error(`Unexpected property ${prop}`);
              }
            });
          })
          .catch(err => {
            logger.log('error', 'Error getting video ratings', err);
            return [
              { path: [ 'videosById', videoId, 'rating' ], value: $error() }
            ];
          });
      });
      
      return Promise.all(getRatingsPromises).then(flattenPathValues);
    }
  },
  {
    // Gets the rating value a user gave to a video 
    route: 'usersById[{keys:userIds}].ratings[{keys:videoIds}].rating',
    get(pathSet) {
      const currentUserId = this.getCurrentUserId();
      const ratingsService = this.getServiceClient(RATINGS_SERVICE);
      const getRatingsPromises = pathSet.userIds.map(userId => {
        // You're only allowed to see your own ratings
        if (currentUserId !== userId) {
          return [
            { path: [ 'usersById', userId, 'ratings' ], value: $error('Not authorized') } 
          ];
        }
        
        // Get rating for each video Id specified
        return pathSet.videoIds.map(videoId => {
          return ratingsService.getUserRatingAsync({ videoId: stringToUuid(videoId), userId: stringToUuid(userId) })
            .then(response => {
              return {
                path: [ 'usersById', userId, 'ratings', videoId, 'rating' ],
                value: response.rating
              };
            })
            .catch(err => {
              logger.log('error', 'Error getting user rating for video', err);
              return {
                path: [ 'usersById', userId, 'ratings', videoId, 'rating' ],
                value: $error()
              };
            });
        });
      });
      
      return Promise.all(getRatingsPromises).then(flattenPathValues);
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