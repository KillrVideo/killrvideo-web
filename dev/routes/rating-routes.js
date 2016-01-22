import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import { _, isUndefined, pick } from 'lodash';

import getVideos from '../data/videos';

// Generate ratings for initial sample videos based on the video id
const ratingsByVideoIdStore = _(getVideos())
  .pluck('videoId')
  .reduce((acc, videoId) => {
    // Use last 5 "digits" of video id as the number of 1...5 star ratings where each "digit" is the number of ratings for a given  
    // star level (i.e. the last "digit" is the number of 5 star ratings, second to last is number of 4 star ratings, etc)
    let last5 = videoId.substr(videoId.length - 6, 5).split('');
    let rating = _(last5).reduce((ratingAcc, val, idx) => {
      var count = parseInt('0x' + val);
      var total = (idx + 1) * count;
      ratingAcc.count += count;
      ratingAcc.total += total;
      return ratingAcc;
    }, { count: 0, total: 0 });
    
    acc[videoId] = rating;
    return acc;
  }, {});

const ratingsByUsedIdStore = {};

/**
 * Route definitions for video ratings.
 */
const routes = [
  {
    // Ratings data is handled by ratings routes
    route: 'videosById[{keys:videoIds}].rating["count", "total"]',
    get(pathSet) {
      const ratingProps = pathSet[3];
      
      let pathValues = [];
      pathSet.videoIds.forEach(videoId => {
        const rating = ratingsByVideoIdStore[videoId];
        ratingProps.forEach(prop => {
          pathValues.push({ 
            path: [ 'videosById', videoId, 'rating', prop ], 
            value: isUndefined(rating) ? 0 : rating[prop] 
          });
        });
      });
      
      return pathValues;
    }
  },
  {
    // Ratings the current user has given to videos
    route: 'usersById[{keys:userIds}].ratings[{keys:videoIds}].rating',
    get(pathSet) {
      let pathValues = [];
      
      const loggedInUserId = this.requestContext.getUserId();
      
      pathSet.userIds.forEach(userId => {
        // Only allowed to retrieve ratings for the currently logged in user
        if (isUndefined(loggedInUserId) || userId !== loggedInUserId) {
          pathValues.push({
            path: [ 'usersById', userId, 'ratings' ],
            value: $error('Not authorized')
          });
          
          return;
        }
        
        let storedRatings = ratingsByUsedIdStore[userId];
        if (isUndefined(storedRatings)) {
          storedRatings = {};
          ratingsByUsedIdStore[userId] = storedRatings;
        }
        
        pathSet.videoIds.forEach(videoId => {
          const rating = storedRatings[videoId];
          pathValues.push({
            path: [ 'usersById', userId, 'ratings', videoId, 'rating' ],
            value: isUndefined(rating) ? $atom() : rating
          });
        });
      });
      
      return pathValues;
    }
  },
  {
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
      const userId = this.requestContext.getUserId();
      if (isUndefined(userId)) {
        pathValues.push({
          path: [ 'videosById', videoId, 'rateErrors' ],
          value: $error('Not currently logged in')
        });
        return pathValues;
      }
      
      // Sanity check on rating value
      if (rating < 1 || rating > 5) {
        pathValues.push({
          path: [ 'videosById', videoId, 'rateErrors' ],
          value: $error(`Invalid rating ${rating}`)
        });
        return pathValues;
      }
      
      // Sanity check on whether alredy rated
      let userRating = ratingsByUsedIdStore[userId];
      if (isUndefined(userRating)) {
        userRating = {};
        ratingsByUsedIdStore[userId] = userRating;
      }
      
      if (!isUndefined(userRating[videoId])) {
        pathValues.push({
          path: [ 'videosById', videoId, 'rateErrors' ],
          value: $error('Already rated')
        });
        return pathValues;
      }
      
      // Modify the stored rating by video Id
      let storedRating = ratingsByVideoIdStore[videoId];
      if (isUndefined(rating)) {
        storedRating = { count: 0, total: 0 }
        ratingsByVideoIdStore[videoId] = storedRating;
      }
      
      // Increment ratings to account for new rating
      storedRating.count += 1;
      storedRating.total += rating;
      
      // Store by user also
      userRating[videoId] = rating;
      
      // Include in response
      pathValues.push({
        path: [ 'videosById', videoId, 'rating' ],
        invalidated: true
      });
      pathValues.push({
        path: [ 'usersById', userId, 'ratings', videoId ],
        invalidated: true
      });
      
      return pathValues;
    }
  }
];

// Export the routes
export default routes;