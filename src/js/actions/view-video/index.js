import { getVideo, resetVideo } from './details';
import { getComments, unloadComments } from './comments';
import { getCurrentUserRating } from './rating';
import { resetAddComment } from './added-comments';

export function load(videoId, videoQueries, commentQueries) {
  return dispatch => {
    // Get the video
    dispatch(getVideo(videoId, videoQueries));
    
    // Get comments
    dispatch(getComments(videoId, commentQueries));
    
    // Get current user rating
    dispatch(getCurrentUserRating(videoId));
  };
};

export function unload() {
  return dispatch => {
    dispatch(resetVideo());
    dispatch(unloadComments());
    dispatch(resetAddComment());
  };
};

export { updateVideoLocation, recordPlayback } from './details';
export { showMoreComments } from './comments';
export { addComment, addAnotherComment } from './added-comments';
export { moreLikeThis } from './more-like-this';
export { rateVideo } from './rating';
