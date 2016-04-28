import { COMMENTS_SERVICE } from '../services/comments';
import { uuidToString, stringToUuid, timestampToDateString } from '../utils/protobuf-conversions';
import { responsePicker, toAtom, toRef } from '../utils/falcor-conversions';
import { pipe, prop, of as toArray, prepend } from 'ramda';
import { createGetPipeline } from '../utils/falcor-pipeline';
import * as P from '../utils/pipeline-functions';

const commentsMap = {
  'commentId': pipe(prop('commentId'), uuidToString),
  'addedDate': pipe(prop('commentTimestamp'), timestampToDateString),
  'author': pipe(prop('userId'), uuidToString, toArray, prepend('usersById'), toRef),
  'video': pipe(prop('videoId'), uuidToString, toArray, prepend('videosById'), toRef)
};

const pickCommentProps = responsePicker(commentsMap);

const routes = [
  {
    // Reference point for comments on a video
    route: 'videosById[{keys:videoIds}].comments',
    get: createGetPipeline(
      P.clearPagingStateCache(2),
      P.createRequestsFromPaths(2, path => ({ pageSize: 1, videoId: stringToUuid(path[1]) })),
      P.doRequests(COMMENTS_SERVICE, (req, client) => { return client.getVideoCommentsAsync(req); }),
      P.mapResultsToTokenRefs('comments', [ 'commentId' ], pickCommentProps)
    )
  },
  {
    // The comments for a video list
    route: 'videosById[{keys:videoIds}].commentsList[{keys:startingTokens}][{ranges:indexRanges}]["commentId", "comment", "addedDate", "author"]',
    get: createGetPipeline(
      P.createPagedRequestsFromPaths(4, path => {
        return {
          videoId: stringToUuid(path[1]),
          startingCommentId: stringToUuid(path[3])
        };
      }),
      P.doRequests(COMMENTS_SERVICE, (req, client) => { return client.getVideoCommentsAsync(req); }),
      // TODO: Pick props
      P.emptyResults()
    )
  },
  {
    // Reference point for comments made by a user
    route: 'usersById[{keys:userIds}].comments',
    get: createGetPipeline(
      P.clearPagingStateCache(2),
      P.createRequestsFromPaths(2, path => ({ pageSize: 1, userId: stringToUuid(path[1]) })),
      P.doRequests(COMMENTS_SERVICE, (req, client) => { return client.getUserCommentsAsync(req); }),
      P.mapResultsToTokenRefs('comments', [ 'commentId' ], pickCommentProps)
    )
  },
  {
    route: 'usersById[{keys:userIds}].commentsList[{keys:startingTokens}][{ranges:indexRanges}]["commentId", "comment", "addedDate", "video"]',
    get: createGetPipeline(
      P.createPagedRequestsFromPaths(4, path => {
        return {
          userId: stringToUuid(path[1]),
          startingCommentId: stringToUuid(path[3])
        };
      }),
      P.doRequests(COMMENTS_SERVICE, (req, client) => { return client.getUserCommentsAsync(req); }),
      // TODO: Pick props
      P.emptyResults()
    )
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