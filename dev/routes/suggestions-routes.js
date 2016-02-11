import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import { _, isUndefined } from 'lodash';

import { getIntFromPartOfUuid } from './util';
import getVideos from '../data/videos';

/**
 * Route definitions for suggesting videos
 */
const routes = [
  {
    // Videos related to another video
    route: 'videosById[{keys:videoIds}].relatedVideos[{integers:indicies}]',
    get(pathSet) {
      const MAX_RELATED_VIDEOS = 6;
      
      let pathValues = [];
      pathSet.videoIds.forEach(videoId => {
        // Use the video Id to generate a start index in the videos array
        const videos = getVideos();
        const startIdx = getIntFromPartOfUuid(videoId, 2, 2, videos.length);
        const relatedVideos = _(videos).map('videoId').slice(startIdx).take(MAX_RELATED_VIDEOS).value();
        
        pathSet.indicies.forEach(idx => {
          pathValues.push({
            path: [ 'videosById', videoId, 'relatedVideos', idx ],
            value: idx < relatedVideos.length ? $ref([ 'videosById', relatedVideos[idx] ]) : $atom()
          });
        });
      });
      
      return pathValues;
    }
  },
  {
    // Personalized recommendations for a user
    route: 'usersById[{keys:userIds}].recommendedVideos[{integers:indicies}]',
    get(pathSet) {
      const MAX_SUGGESTED_VIDEOS = 5;
      
      let pathValues = [];
      pathSet.userIds.forEach(userId => {
        // Only authorized to retrieve suggested videos for the logged in user
        if (this.requestContext.getUserId() !== userId) {
          pathValues.push({
            path: [ 'usersById', userId, 'recommendedVideos' ],
            value: $error('Not authorized')
          });
          return;
        }
        
        // Use the user id to generate a start index in the videos array
        const videos = getVideos();
        const startIdx = getIntFromPartOfUuid(userId, 0, 2, videos.length);
        const suggestedVideos = _(videos).map('videoId').slice(startIdx).take(MAX_SUGGESTED_VIDEOS).value();
        
        pathSet.indicies.forEach(idx => {
          pathValues.push({
            path: [ 'usersById', userId, 'recommendedVideos', idx ],
            value: idx < suggestedVideos.length ? $ref([ 'videosById', suggestedVideos[idx] ]) : $atom()
          });
        });
      });
      
      return pathValues;
    }
  }
];

export default routes;