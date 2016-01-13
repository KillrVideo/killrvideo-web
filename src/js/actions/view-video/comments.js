import { createPagedActions } from 'actions/paged';

const comments = createPagedActions(state => state.viewVideo.comments);

export function getComments(commentQueries) {
  return (dispatch, getState) => {
    const { router: { params: { videoId } } } = getState();
    return dispatch(comments.getInitialPage([ 'videosById', videoId, 'comments' ], commentQueries));
  };
};

export const showMoreComments = comments.nextPageClick;

export const unloadComments = comments.unload;