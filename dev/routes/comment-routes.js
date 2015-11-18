import { _, isUndefined, range, pick } from 'lodash';
import moment from 'moment';
import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import uuid from 'uuid';

import { getIntFromPartOfUuid } from './util';
import getUsers from '../data/users';
import getVideos from '../data/videos';
import getComments from '../data/comments';

// Arrays of all initial comment text and user ids
const commentText = getComments();
const userIds = _(getUsers()).pluck('userId').value();

// Generate comments for all the initial videos
const commentsByVideoIdStore = _(getVideos())
  .map(v => ({ videoId: v.videoId, addedDate: v.addedDate }))
  .reduce((acc, v) => {
    // What index to start pulling comments from
    let commentIdx = getIntFromPartOfUuid(v.videoId, 1, 2, commentText.length);
  
    // What index to start pulling users for the comment from
    let userIdx = getIntFromPartOfUuid(v.videoId, 3, 2, userIds.length);
  
    // How many comments to pull
    let numComments = getIntFromPartOfUuid(v.videoId, v.videoId.length - 3, 2, commentText.length);
  
    acc[v.videoId] = range(0, numComments).map(i => {
      let idxInCommentsList = (commentIdx + i) % commentText.length;
      let idxInUsersList = (userIdx + i) % userIds.length;
      return {
        commentId: uuid.v4(),
        comment: commentText[idxInCommentsList],
        addedDate: moment(v.addedDate).add(i, 'days').toISOString(),
        author: userIds[idxInUsersList]
      }
    });
    
    return acc;
  }, {});
  
/**
 * Route definitions for comments.
 */
const routes = [
  {
    route: 'commentsByVideoId[{keys:videoIds}]',
    get(pathSet) {
      let pathValues = [];
      
      // Create some server-side cursor state and return a reference to a path
      pathSet.videoIds.forEach(videoId => {
        const cursorId = uuid.v4();
        const cursor = {
          videoId: videoId,
          pagingStates: {
            '0': null
          }
        };
        this.request.session[cursorId] = cursor;
        pathValues.push({
          path: [ 'commentsByVideoId', videoId ],
          value: $ref([ 'commentsByVideoCursorId', cursorId ])
        });
      });
      
      return pathValues;
    }
  },
  {
    // Comments by video with a stable view (i.e. using some server-side cursor state) that will allow for paging
    // even when the comments change (NOTE: Route can be invoked multiple times when 'author' is requested since 
    // the path will have further leaf nodes for the user's info)
    route: 'commentsByVideoCursorId[{keys:cursorIds}][{ranges:indexRanges}]["commentId", "comment", "addedDate", "author"]',
    get(pathSet) {
      const commentProps = pathSet[3];
      let pathValues = [];
      
      pathSet.cursorIds.forEach(cursorId => {
        // Get the cursor state from session storage
        const { videoId, pagingStates } = this.request.session[cursorId];
        if (isUndefined(videoId)) {
          pathValues.push({
            path: [ 'commentsByVideoCursorId', cursorId ],
            value: $error('Comment state not found.')
          });
          return;
        }
        
        // Should only have a single range and its from index should match our cursor state's nextIndex
        if (pathSet.indexRanges.length !== 1) {
          pathValues.push({
            path: [ 'commentsByVideoCursorId', cursorId ],
            value: $error(`Expected only 1 range but got ${pathSet.indexRanges.length}`)
          });
          return;
        }
        
        const idxRange = pathSet.indexRanges[0];
        const pagingState = pagingStates[idxRange.from];
        if (isUndefined(pagingState)) {
          pathValues.push({
            path: [ 'commentsByVideoCursorId', cursorId ],
            value: $error(`No paging state found for range starting at ${idxRange.from}`)
          });
          return;
        }
               
        let commentsForVideo = _(commentsByVideoIdStore[videoId]);
        if (pagingState !== null) {
          // The paging state will be the last record we retrieved so skip everything up to that point
          let found = false;
          commentsForVideo = commentsForVideo.dropWhile(comment => {
            if (found) return false;
            found = comment.commentId === pagingState;
            return true;
          });
        }
        commentsForVideo = commentsForVideo.value();
        
        // Generate a path value for each index in the range
        let lastCommentId = null;
        _.range(idxRange.from, idxRange.to + 1).forEach(idx => {
          // Adjust the index so it's relative to all the records we just (maybe) skipped
          const idxInComments = idx - idxRange.from;
          
          if (isUndefined(commentsForVideo) || idxInComments >= commentsForVideo.length) {
            pathValues.push({ 
              path: [ 'commentsByVideoCursorId', cursorId, idx ], 
              value: $atom()
            });
            lastCommentId = null;
          } else {
            const comment = commentsForVideo[idxInComments];
            commentProps.forEach(prop => {
              pathValues.push({ 
                path: [ 'commentsByVideoCursorId', cursorId, idx, prop ], 
                value: prop !== 'author' ? comment[prop] : $ref([ 'usersById', comment.author ])
              });
            });
            lastCommentId = comment.commentId;
          }
        });
        
        // Save new cursor state to session
        pagingStates[idxRange.to + 1] = lastCommentId;
        this.request.session[cursorId] = {
          videoId,
          pagingStates
        };
      });
      
      return pathValues;
    }
  },
  {
    // Adding a comment to a video
    route: 'commentsByVideoId[{keys:videoIds}].add',
    call(callPath, args) {
      console.log('Adding comment!');
      return [];
    }
  }
];

// Export the routes
export default routes;