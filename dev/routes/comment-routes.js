import { _, isUndefined, range, forIn } from 'lodash';
import moment from 'moment';
import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import uuid from 'uuid';

import { getIntFromPartOfUuid, getIndexesFromRanges } from './util';
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
        author: userIds[idxInUsersList],
        video: v.videoId
      }
    });
    
    return acc;
  }, {});
  
/**
 * Route definitions for comments.
 */
const routes = [
  {
    // Comments for a given video
    route: 'videosById[{keys:videoIds}].comments',
    get(pathSet) {
      let pathValues = [];
      
      pathSet.videoIds.forEach(videoId => {
        const commentsForVideo = commentsByVideoIdStore[videoId];
        const firstCommentId = isUndefined(commentsForVideo) || commentsForVideo.length === 0
          ? ''
          : commentsForVideo[0].commentId;
        
        // Return a reference to a stable view of the comments (i.e. where the starting comment id is specified)
        pathValues.push({
          path: [ 'videosById', videoId, 'comments' ],
          value: $ref([ 'commentsByVideo', `${videoId}_${firstCommentId}` ])
        });
      });
      
      return pathValues;
    }
  },
  {
    route: 'commentsByVideo[{keys:videoTokens}][{ranges:indexRanges}]["commentId", "comment", "addedDate", "author"]',
    get(pathSet) {
      const commentProps = pathSet[3];
      let pathValues = [];
      
      pathSet.videoTokens.forEach(token => {
        // Token should be a combination of videoId_startingCommentId
        let [ videoId, firstCommentId ] = token.split('_');
        let commentsForVideo = commentsByVideoIdStore[videoId];
        if (isUndefined(firstCommentId)) {
          pathValues.push({
            path: [ 'commentsByVideo', token ],
            value: $error('Invalid token.')
          });
          return;
        }
        
        // If the first comment Id is empty, that means we don't have any comments for the video so just return empty atoms
        // for all indexes in the range
        if (firstCommentId === '') {
          getIndexesFromRanges(pathSet.indexRanges).forEach(idx => {
            pathValues.push({
              path: [ 'commentsByVideo', token, idx ],
              value: $atom()
            });
          });
          return;
        }
        
        // Figure out where to start in the comments for the video
        let startIdx = _(commentsForVideo).findIndex(comment => comment.commentId === firstCommentId);
        if (startIdx === -1) throw new Error('Unexpected start index.');
        
        getIndexesFromRanges(pathSet.indexRanges).forEach(idx => {
          // Adjust index by the starting position
          const idxInComments = idx + startIdx;
          if (idxInComments < commentsForVideo.length) {
            commentProps.forEach(prop => {
              pathValues.push({
                path: [ 'commentsByVideo', token, idx, prop ],
                value: prop !== 'author' ? commentsForVideo[idxInComments][prop] : $ref([ 'usersById', commentsForVideo[idxInComments].author ]) 
              });
            });
          } else {
            pathValues.push({
              path: [ 'commentsByVideo', token, idx ],
              value: $atom()
            });
          }
        });
      });
      
      return pathValues;
    }
  },
  {
    // Adding a comment to a video
    route: 'commentsByVideo[{keys:videoTokens}].add',
    call(callPath, args) {
      const [ comment ] = args;
      let pathValues = [];
      
      if (callPath.videoTokens.length !== 1) {
        callPath.videoTokens.forEach(token => {
          pathValues.push({
            path: [ 'commentsByVideo', token, 'addErrors' ],
            value: $error('Cannot add a comment to multiple videos.')
          });
        });
        return pathValues;
      }
      
      const token = callPath.videoTokens[0];
      const [ videoId ] = token.split('_');
      
      // Get current user
      const userId = this.requestContext.getUserId();
      if (isUndefined(userId)) {
        pathValues.push({
          path: [ 'commentsByVideo', token, 'addErrors' ],
          value: $error('Not currently logged in')
        });
        return pathValues;
      }
      
      // Add the comment to our internal collection by video id
      let commentsForVideo = commentsByVideoIdStore[videoId];
      if (isUndefined(commentsForVideo)) {
        commentsForVideo = [];
        commentsByVideoIdStore[videoId] = commentsForVideo;
      }
      let newComment = {
        commentId: uuid.v4(),
        comment: comment,
        addedDate: moment().toISOString(),
        author: userId,
        video: videoId
      };
      commentsForVideo.splice(0, 0, newComment);
      
      // Return the comment data
      forIn(newComment, (propValue, prop) => {
        pathValues.push({
          path: [ 'commentsByVideo', token, 'addedComments', 0, prop ],
          value: prop !== 'author' ? propValue : $ref([ 'usersById', propValue ]) 
        });
      });
      
      // Invalidate the reference for the video and user comments collections so client will come back
      // to the server next time in needs those comments
      pathValues.push(
        { path: [ 'videosById', videoId, 'comments' ], invalidated: true }, 
        { path: [ 'usersById', userId, 'comments' ], invalidated: true }
      );
      
      return pathValues;
    }
  },
  {
    route: 'usersById[{keys:userIds}].comments[{ranges:indexRanges}]["commentId", "comment", "addedDate", "author", "video"]',
    get(pathSet) {
      const commentProps = pathSet[4];
      
      let pathValues = [];
      
      pathSet.userIds.forEach(userId => {
        // Slow to scan all comments by id, but will get the job done
        const commentsByUser = _(commentsByVideoIdStore).values().flatten()
          .where({ author: userId })
          .sortByOrder([ c => moment(c.addedDate).toDate() ], [ 'desc' ])
          .value();
                
        getIndexesFromRanges(pathSet.indexRanges).forEach(idx => {
          // Does comment exist at that index?
          if (idx >= commentsByUser.length) {
            pathValues.push({
              path: [ 'usersById', userId, 'comments', idx ],
              value: $atom()
            });
            return;
          }
          
          // Get properties requested
          const comment = commentsByUser[idx];
          commentProps.forEach(prop => {
            let val;
            switch(prop) {
              case 'author':
                val = $ref([ 'usersById', comment.author ]);
                break;
              case 'video':
                val = $ref([ 'videosById', comment.video ]);
                break;
              default:
                val = comment[prop];
                break;
            }
            
            pathValues.push({
              path: [ 'usersById', userId, 'comments', idx, prop ],
              value: val
            });
          });
        });
      });
      
      return pathValues;
    }
  }
];

// Export the routes
export default routes;