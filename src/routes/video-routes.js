import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import Promise from 'bluebird';
import { getClientAsync } from '../services/video-catalog';
import { uuidToString, stringToUuid, timestampToDate } from '../utils/protobuf-conversions';
import { getIndexesFromRanges, flattenPathValues } from '../utils/falcor-utils';
import { logger } from '../utils/logging';

// All routes supported by the video catalog service
const routes = [
  {
    // Basic video catalog data
    route: 'videosById[{keys:videoIds}]["videoId", "addedDate", "description", "location", "locationType", "name", "tags", "author"]',
    get(pathSet) {
      // The array of props to get for the video
      const videoProps = pathSet[2];
      
      // Map video ids requested to individual promise requests to the video catalog service
      const getVideoPromises = pathSet.videoIds.map(videoId => {
        return getClientAsync()
          .then(client => client.getVideoAsync({ videoId: stringToUuid(videoId) }))
          .then(response => {
            // Turn response into an array of path values
            return videoProps.map(prop => {
              const path = [ 'videosById', videoId, prop ];
              switch(prop) {
                // Tags need to be wrapped in an atom since they are an array meant to be retrieved together and not by individual index
                case 'tags':
                  return { path, value: $atom(response.tags) };
                // Author is a reference to a user by id
                case 'author':
                  return { path, value: $ref([ 'usersById', uuidToString(response.userId) ]) };
                // Video Id we just want the string value
                case 'videoId':
                  return { path, value: uuidToString(response.videoId) };
                // Convert added date to a Date
                case 'addedDate':
                  return { path, value: timestampToDate(response.addedDate) }
                default:
                  return { path, value: response[prop] }
              }
            });
          })
          .catch(err => {
            logger.log('error', 'Error while getting video %d', videoId, err);
            return [
              { path: [ 'videosById', videoId ], value: $error() }
            ]
          });
      });
      
      // Flatten all path values returned by promies into a single array of path values
      return Promise.all(getVideoPromises).then(flattenPathValues);
    }
  },
  {
    // Get recent videos
    route: 'recentVideos[{ranges:indexRanges}]["videoId", "name", "previewImageLocation", "addedDate" ]',
    get(pathSet) {
      
    }
  }
];

export default routes;