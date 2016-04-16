import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import Promise from 'bluebird';
import { COMMENTS_SERVICE } from '../services/comments';
import { uuidToString, stringToUuid } from '../utils/protobuf-conversions';
import { flattenPathValues } from '../utils/falcor-utils';
import { logger } from '../utils/logging';

const routes = [
  {
    // Reference point for comments on a video
    route: 'videosById[{keys:videoIds}].comments',
    get(pathSet) {
      // TODO: Return a reference to comments with stable paging
      throw new Error('Not implemented');
    }
  },
  {
    // The comments for a video list
    route: 'commentsByVideo[{keys:videoIds}][{keys:startingTokens}][{ranges:indexRanges}]["commentId", "comment", "addedDate", "author"]',
    get(pathSet) {
      throw new Error('Not implemented');
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