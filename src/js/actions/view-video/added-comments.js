import { createActionTypeConstants } from 'actions/promises';
import { createAction } from 'redux-actions';
import { model } from 'stores/falcor-model';

const ADD_COMMENT = 'viewVideo/ADD_COMMENT';
export const ActionTypes = {
  ADD_COMMENT: createActionTypeConstants(ADD_COMMENT),
  ADD_COMMENT_RESET: 'viewVideo/ADD_COMMENT_RESET',
  ADD_ANOTHER_COMMENT: 'viewVideo/ADD_ANOTHER_COMMENT'
};

export function addComment(comment, commentQueries) {
  return (dispatch, getState) => {
    const { router: { params: { videoId } } } = getState();
    
    commentQueries = commentQueries.map(q => [ 'addedComments', 0, ...q ]);
    const promise = model.call([ 'videosById', videoId, 'comments', 'add' ], [ comment ], [], commentQueries)
      .then(response => response.json.videosById[videoId].comments.addedComments[0]);
    
    dispatch({
      type: ADD_COMMENT,
      payload: {
        promise,
        data: {
          promise
        }
      }
    });
  };
};

export const resetAddComment = createAction(ActionTypes.ADD_COMMENT_RESET);
export const addAnotherComment = createAction(ActionTypes.ADD_ANOTHER_COMMENT);