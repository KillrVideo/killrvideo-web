import { getVideo, resetVideo } from './details';
import { getComments, unloadComments } from './comments';
import { getCurrentUserRating } from './rating';
import { resetAddComment } from './added-comments';

export function load(videoQueries, commentQueries) {
  return dispatch => {
    // Get the video
    dispatch(getVideo(videoQueries));
    
    // Get comments
    dispatch(getComments(commentQueries));
    
    // Get current user rating
    dispatch(getCurrentUserRating());
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
