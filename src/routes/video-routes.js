import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import Promise from 'bluebird';
import { getClientAsync } from '../services/video-catalog';
import { uuidToString, stringToUuid, timestampToDateString, dateStringToTimestamp } from '../utils/protobuf-conversions';
import { getIndexesFromRanges, groupIndexesByPagingState, flattenPathValues } from '../utils/falcor-utils';
import { logger } from '../utils/logging';

// Constant used in routes below to indicate a list is empty
const EMPTY_LIST_VALUE = 'NONE';

// All routes supported by the video catalog service
const routes = [
  {
    // Basic video catalog data by video Id
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
                // Video Id we just want the string value
                case 'videoId':
                  return { path, value: uuidToString(response.videoId) };
                // Convert added date to a Date
                case 'addedDate':
                  return { path, value: timestampToDateString(response.addedDate) };
                // Author is a reference to a user by id
                case 'author':
                  return { path, value: $ref([ 'usersById', uuidToString(response.userId) ]) };
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
    // Reference point for the recent videos list
    route: 'recentVideos',
    get(pathSet) {
      // Reset any cached paging state
      this.pagingStateCache.clearKey('recentVideos');
      
      // Figure out the latest video so we can return a reference to a list that's stable for paging
      return getClientAsync()
        .then(client => client.getLatestVideoPreviewsAsync({ pageSize: 1 }))
        .then(response => {
          let startingVideoToken = EMPTY_LIST_VALUE;
          if (response.videoPreviews.length === 1) {
            // Use video id and added date as token
            startingVideoToken = `${uuidToString(response.videoPreviews[0].videoId)}_${timestampToDateString(response.videoPreviews[0].addedDate)}`;
          }
          return [
            { path: [ 'recentVideos' ], value: $ref([ 'recentVideosList', startingVideoToken ]) }
          ];
        })
        .catch(err => {
          logger.log('error', 'Error while getting latest video preview', err);
          return [
            { path: [ 'recentVideos' ], value: $error() }
          ];
        });
    }
  },
  {
    // The recent videos list
    route: 'recentVideosList[{keys:startingVideoTokens}][{ranges:indexRanges}]["videoId", "name", "previewImageLocation", "addedDate", "author", "stats"]',
    get(pathSet) {
      // This should only ever get called with a single starting video token, so do a sanity check
      if (pathSet.startingVideoTokens.length != 1) {
        logger.log('error', 'Got request for recent videos with %d starting video tokens', pathSet.startingVideoTokens.length);
        return pathSet.startingVideoTokens.map(token => {
          return { path: [ 'recentVideosList', token ], value: $error() };
        });
      }
      
      const startingVideoToken = pathSet.startingVideoTokens[0];
      
      // If list is empty, no need to go to service
      if (startingVideoToken === EMPTY_LIST_VALUE) {
        return getIndexesFromRanges(pathSet.indexRanges).map(idx => {
          return { path: [ 'recentVideosList', startingVideoToken, idx ], value: $atom() };
        });
      }
      
      // Parse the token into video id and added date
      const tokenParts = startingVideoToken.split('_');
      const startingVideoId = stringToUuid(tokenParts[0]);
      const startingAddedDate = dateStringToTimestamp(tokenParts[1]);
      
      // The props to get for the videos
      const videoProps = pathSet[3];
      
      // Get all indexes from the ranges and all available paging states saved in session
      const allIndexes = getIndexesFromRanges(pathSet.indexRanges);
      let pagingStates = this.pagingStateCache.getKey('recentVideos');
      
      // Group the indexes by the paging state they can use for the query, then do queries      
      const getPreviewsPromises = groupIndexesByPagingState(allIndexes, pagingStates).map(idxsAndPaging => {
        const { startingIndex, pagingState, indexes, isLastAvailablePagingState } = idxsAndPaging;
        
        // Create a request object to call the service with
        const getRequest = {
          pageSize: indexes[indexes.length - 1],
          startingAddedDate,
          startingVideoId,
          pagingState
        };
        
        // Make the request
        return getClientAsync()
          .then(client => client.getLatestVideoPreviewsAsync(getRequest))
          .tap(response => {
            // Save the paging state to session if necessary
            if (isLastAvailablePagingState && response.pagingState !== '') {
              let nextStartingIndex = indexes[indexes.length - 1] + 1;
              this.pagingStateCache.saveKey('recentVideos', nextStartingIndex, response.pagingState);
            }
          })
          .then(response => {
            const pathValues = indexes.map(idx => {
              // Did we get a video preview at the index we're looking for?
              const adjustedIdx = idx - startingIndex;
              if (adjustedIdx >= response.videoPreviews.length) {
                // Nope, just return an empty atom
                return [
                  { path: [ 'recentVideosList', startingVideoToken, idx ], value: $atom() }
                ];
              }
              
              // Yup, get the properties that were requested
              const videoPreview = response.videoPreviews[adjustedIdx];
              return videoProps.map(prop => {
                const path = [ 'recentVideosList', startingVideoToken, idx, prop ];
                switch (prop) {
                  case 'videoId':
                    return { path, value: uuidToString(videoPreview.videoId) };
                  case 'addedDate':
                    return { path, value: timestampToDateString(videoPreview.addedDate) };
                  case 'author':
                    return { path, value: $ref([ 'usersById', uuidToString(videoPreview.userId) ]) };
                  case 'stats':
                    return { path, value: $ref([ 'videosById', uuidToString(videoPreview.videoId), 'stats' ]) };
                  default:
                    return { path, value: videoPreview[prop] };
                }
              });
            });
            
            return flattenPathValues(pathValues);
          })
          .catch(err => {
            logger.log('error', 'Error while getting latest videos', err);
            return indexes.map(idx => {
              return { path: [ 'recentVideosList', startingVideoToken, idx ], value: $error() }
            });
          });
      });
      
      return Promise.all(getPreviewsPromises).then(flattenPathValues);
    }
  },
  {
    // Reference point for list of videos by author (user) Id
    route: 'usersById[{keys:userIds}].videos',
    get(pathSet) {
      // Reset any cached paging state
      pathSet.userIds.forEach(userId => {
        this.pagingStateCache.clearKey(`userVideos_${userId}`);
      });
      
      // Figure out the latest video for each user so we can return a reference to a list that's stable for paging
      return getClientAsync()
        .then(client => {
          const getUserVideoPromises = pathSet.userIds.map(userId => {
            return client.getUserVideoPreviewsAsync({ pageSize: 1 })
              .then(response => {
                let startingVideoToken = EMPTY_LIST_VALUE;
                if (response.videoPreviews.length === 1) {
                  startingVideoToken = `${uuidToString(response.videoPreviews[0].videoId)}_${timestampToDateString(response.videoPreviews[0].addedDate)}`;
                }
                return [
                  { path: [ 'usersById', userId, 'videos' ], value: $ref([ 'userVideosList', userId, startingVideoToken ]) }
                ];
              })
              .catch(err => {
                logger.log('error', 'Error while getting user latest video', err);
                return [
                  { path: [ 'usersById', userId, 'videos' ], value: $error() }
                ];
              });
          });
          
          return Promise.all(getUserVideoPromises).then(flattenPathValues);
        });
    }
  },
  {
    // List of videos added by a particular user
    route: 'userVideosList[{keys:userIds}][{keys:startingVideoTokens}][{ranges:indexRanges}]["videoId", "name", "previewImageLocation", "addedDate", "author"]',
    get(pathSet) {
      // TODO: User videos list
      throw new Error('Not implemented');
    }
  },
  {
    // Submit a YouTube video to the catalog
    route: 'usersById[{keys:userIds}].videos.addYouTube',
    call(callPath, args) {
      // TODO: Add YouTube video
      throw new Error('Not implemented');
    }
  },
  {
    // Submit an uploaded video to the catalog
    route: 'usersById[{keys:userIds}].videos.addUploaded',
    call(callPath, args) {
      // TODO: Add Uploaded video
      throw new Error('Not implemented');
    }
  }
];

export default routes;