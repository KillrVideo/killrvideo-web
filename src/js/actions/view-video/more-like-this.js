import { createPagedActions } from 'actions/paged';

const moreLikeThis = createPagedActions(state => state.viewVideo.moreLikeThis);

moreLikeThis.load = function(videoId, queries) {
  return moreLikeThis.getInitialPage([ 'videosById', videoId, 'relatedVideos' ], queries);
};

export { moreLikeThis };