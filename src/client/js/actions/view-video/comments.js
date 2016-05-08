import { createPagedActions } from 'actions/paged';

const comments = createPagedActions(state => state.viewVideo.comments);

export function getComments(videoId, commentQueries) {
  return comments.getInitialPage([ 'videosById', videoId, 'comments' ], commentQueries);
};

export const showMoreComments = comments.nextPageClick;

export const unloadComments = comments.unload;