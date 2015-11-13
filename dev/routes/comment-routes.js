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
    // Comments for a given video Id
    route: 'commentsByVideoId[{keys:videoIds}][{ranges:indexRanges}]["commentId", "comment", "addedDate", "author"]',
    get(pathSet) {
      const commentProps = pathSet[3];
      const commentsByVideoId = _(pathSet.videoIds)
        .reduce((acc, videoId) => {
          // Are there comments for the video?
          let comments = commentsByVideoIdStore[videoId];
          if (isUndefined(comments)) {
            acc[videoId] = $atom(null);
            return acc;
          }
          
          acc[videoId] = _(pathSet.indexRanges)
            .reduce((rangesAcc, idxRange) => {
              // Loop through all indexes in range and pull comments for the video from the array
              range(idxRange.from, idxRange.to + 1).forEach(idx => {
                rangesAcc[idx] = idx < comments.length
                  ? pick(comments[idx], commentProps)
                  : $atom(null);
                  
                // Replace author ids with references to users by id
                if (rangesAcc[idx].author) 
                  rangesAcc[idx].author = $ref([ 'usersById', rangesAcc[idx].author ]);
              });
              
              return rangesAcc;
            }, {});
          
          return acc;
        }, {});
      return { jsonGraph: { commentsByVideoId } };
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