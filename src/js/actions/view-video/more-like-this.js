import { createPagedActions } from 'actions/paged';

const moreLikeThis = createPagedActions(state => state.viewVideo.moreLikeThis);

moreLikeThis.load = function(queries) {
  return (dispatch, getState) => {
    const { router: { params: { videoId } } } = getState();
    return dispatch(moreLikeThis.getInitialPage([ 'videosById', videoId, 'relatedVideos' ], queries));
  };
};

export { moreLikeThis };