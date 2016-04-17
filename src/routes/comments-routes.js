import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import Promise from 'bluebird';
import { COMMENTS_SERVICE } from '../services/comments';
import { uuidToString, stringToUuid, timestampToDateString } from '../utils/protobuf-conversions';
import { flattenPathValues, EMPTY_LIST_VALUE, getIndexesFromRanges, groupIndexesByPagingState, savePagingStateIfNecessary, explodePaths, toEmptyPathValue } from '../utils/falcor-utils';
import { logger } from '../utils/logging';

const routes = [
  {
    // Reference point for comments on a video
    route: 'videosById[{keys:videoIds}].comments',
    get(pathSet) {
      const commentsService = this.getServiceClient(COMMENTS_SERVICE);
      
      // Reset any cached paging state
      pathSet.videoIds.forEach(videoId => {
        this.pagingStateCache.clearKey(`commentsByVideo_${videoId}`);
      });
      
      return Promise.map(pathSet.videoIds, videoId => {
          return commentsService.getVideoCommentsAsync({ videoId: stringToUuid(videoId), pageSize: 1 })
            .then(response => {
              let startingCommentToken = EMPTY_LIST_VALUE;
              if (response.comments.length === 1) {
                startingCommentToken = uuidToString(response.comments[0].commentId);
              }
              return {
                path: [ 'videosById', videoId, 'comments'],
                value: $ref([ 'commentsByVideo', videoId, startingCommentToken ])
              };
            })
            .catch(err => {
              logger.log('error', 'Error while getting latest comment for video', err);
              return { path: [ 'videosById', videoId, 'comments' ], value: $error() }
            });
        })
        .all();
    }
  },
  {
    // The comments for a video list
    route: 'commentsByVideo[{keys:videoIds}][{keys:startingTokens}][{ranges:indexRanges}]["commentId", "comment", "addedDate", "author"]',
    get(pathSet) {
      // Sanity check, this should always be called with only a single video id and starting token combination
      // since they will be unique
      if (pathSet.videoIds.length !== 1 || pathSet.startingTokens.length !== 1) {
        throw new Error('Requests should always have a single videoId and token combination');
      }
      
      const videoId = pathSet.videoIds[0];
      const startingToken = pathSet.startingTokens[0];
      
      // If the token is for an empty list, no need to go ask the service for comments
      if (startingToken === EMPTY_LIST_VALUE) {
        return explodePaths(pathSet, 3).map(toEmptyPathValue);
      }
      
      // The properties to get for each comment
      const commentProps = pathSet[4];
      
      const commentsService = this.getServiceClient(COMMENTS_SERVICE);
      
      // Get all indexes from the ranges and all available paging states saved in session
      const pagingStateCacheKey = `commentsByVideo_${videoId}`; 
      const allIndexes = getIndexesFromRanges(pathSet.indexRanges);
      let pagingStates = this.pagingStateCache.getKey(pagingStateCacheKey);
      
      return Promise.map(groupIndexesByPagingState(allIndexes, pagingStates), idxsAndPaging => {
          const { startingIndex, pagingState, indexes, isLastAvailablePagingState } = idxsAndPaging;
        
          // Create a request object to call the service with
          const getRequest = {
            videoId: stringToUuid(videoId),
            pageSize: indexes[indexes.length - 1] - startingIndex + 1,
            startingCommentId: stringToUuid(startingToken),
            pagingState
          };
          
          // Get the comments
          return commentsService.getVideoCommentsAsync(getRequest)
            .tap(savePagingStateIfNecessary(idxsAndPaging, this.pagingStateCache, pagingStateCacheKey))
            .then(response => {
              return flattenPathValues(indexes.map(idx => {
                // Did we get a comment for that index?
                const adjustedIdx = idx - startingIndex;
                if (adjustedIdx >= response.comments.length) {
                  // Nope, just return an empty atom
                  return [
                    { path: [ 'commentsByVideo', videoId, startingToken, idx ], value: $atom() }
                  ];
                }
                
                // Yup, get the requested properties
                const comment = response.comments[adjustedIdx];
                return commentProps.map(prop => {
                  const path = [ 'commentsByVideo', videoId, startingToken, idx, prop ];
                  switch (prop) {
                    case 'commentId':
                      return { path, value: uuidToString(comment.commentId) };
                    case 'addedDate':
                      return { path, value: timestampToDateString(comment.commentTimestamp) };
                    case 'author':
                      return { path, value: $ref([ 'usersById', uuidToString(comment.userId) ]) };
                    default:
                      return { path, value: comment[prop] };
                  }
                });
              }));
            })
            .catch(err => {
              logger.log('error', 'Error while getting comments for video', err);
              return indexes.map(idx => {
                return { path: [ 'commentsByVideo', videoId, startingToken, idx ], value: $error() };
              });
            })
        })
        .all()
        .then(flattenPathValues);
    }
  },
  {
    // Reference point for comments made by a user
    route: 'usersById[{keys:userIds}].comments',
    get(pathSet) {
      // TODO: Return a reference to comments with stable paging
      throw new Error('Not implemented');
    }
  },
  {
    route: 'commentsByUser[{keys:userIds}][{keys:startingTokens}][{ranges:indexRanges}]["commentId", "comment", "addedDate", "video"]',
    get(pathSet) {
      throw new Error('Not implemented');
    }
  },
  {
    // Leave a comment on a video
    route: 'videosById[{keys:videoIds}].comments.add',
    call(callPath, args) {
      // TODO: Is this the right path since comments is a reference above?
      throw new Error('Not implemented');
    }
  }
];

export default routes;