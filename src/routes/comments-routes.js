import { COMMENTS_SERVICE } from '../services/comments';
import { uuidToString, stringToUuid, timestampToDateString } from '../utils/protobuf-conversions';
import { toRef } from './common/sentinels';
import { createPropPicker } from './common/props';
import { pipe, prop, of as toArray, prepend } from 'ramda';
import * as Common from './common';

const commentsMap = {
  'commentId': pipe(prop('commentId'), uuidToString),
  'addedDate': pipe(prop('commentTimestamp'), timestampToDateString),
  'author': pipe(prop('userId'), uuidToString, toArray, prepend('usersById'), toRef),
  'video': pipe(prop('videoId'), uuidToString, toArray, prepend('videosById'), toRef)
};

const pickCommentProps = createPropPicker(commentsMap);

const routes = [
  {
    // Reference point for comments on a video
    route: 'videosById[{keys:videoIds}].comments',
    get: Common.listReference(
      path => ({ pageSize: 1, videoId: stringToUuid(path[1]) }),
      COMMENTS_SERVICE,
      (req, client) => { return client.getVideoCommentsAsync(req); },
      [ 'commentId' ], 
      pickCommentProps
    )
  },
  {
    // The comments for a video list
    route: 'videosById[{keys:videoIds}].commentsList[{keys:startingTokens}][{ranges:indexRanges}]["commentId", "comment", "addedDate", "author"]',
    get: Common.pagedServiceRequest(
      path => {
        return {
          videoId: stringToUuid(path[1]),
          startingCommentId: stringToUuid(path[3])
        };
      },
      COMMENTS_SERVICE,
      (req, client) => { return client.getVideoCommentsAsync(req); },
      pickCommentProps
    )
  },
  {
    // Reference point for comments made by a user
    route: 'usersById[{keys:userIds}].comments',
    get: Common.listReference(
      path => ({ pageSize: 1, userId: stringToUuid(path[1]) }),
      COMMENTS_SERVICE,
      (req, client) => { return client.getUserCommentsAsync(req); },
      [ 'commentId' ],
      pickCommentProps
    )
  },
  {
    route: 'usersById[{keys:userIds}].commentsList[{keys:startingTokens}][{ranges:indexRanges}]["commentId", "comment", "addedDate", "video"]',
    get: Common.pagedServiceRequest(
      path => {
        return {
          userId: stringToUuid(path[1]),
          startingCommentId: stringToUuid(path[3])
        };
      },
      COMMENTS_SERVICE,
      (req, client) => { return client.getUserCommentsAsync(req); },
      pickCommentProps
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