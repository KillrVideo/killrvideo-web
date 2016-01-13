import { getVideo, resetVideo } from './details';
import { getComments, unloadComments } from './comments';
import { resetAddComment } from './added-comments';

export function load(videoQueries, commentQueries) {
  return dispatch => {
    // Get the video
    dispatch(getVideo(videoQueries));
    
    // Get comments
    dispatch(getComments(commentQueries));
  };
};

export function unload() {
  return dispatch => {
    dispatch(resetVideo());
    dispatch(unloadComments());
    dispatch(resetAddComment());
  };
};

export { updateVideoLocation } from './details';
export { showMoreComments } from './comments';
export { addComment, addAnotherComment } from './added-comments';
export { moreLikeThis } from './more-like-this';
