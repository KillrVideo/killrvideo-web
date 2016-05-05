import { createActionTypeConstants } from 'actions/promises';
import { createAction } from 'redux-actions';
import { model } from 'stores/falcor-model';
import { throwAsReduxFormErrorForField } from 'lib/redux-form-error';

const ADD_COMMENT = 'viewVideo/ADD_COMMENT';
export const ActionTypes = {
  ADD_COMMENT: createActionTypeConstants(ADD_COMMENT),
  ADD_COMMENT_RESET: 'viewVideo/ADD_COMMENT_RESET',
  ADD_ANOTHER_COMMENT: 'viewVideo/ADD_ANOTHER_COMMENT'
};

export function addComment(videoId, comment) {
  return (dispatch, getState) => {
    const promise = model.call([ 'videosById', videoId, 'comments', 'add' ], [ comment ], [], [])
      .catch(throwAsReduxFormErrorForField('comment'))
      .return(comment);
    
    dispatch({
      type: ADD_COMMENT,
      payload: {
        promise,
        data: {
          promise
        }
      }
    });
    
    return promise;
  };
};

export const resetAddComment = createAction(ActionTypes.ADD_COMMENT_RESET);
export const addAnotherComment = createAction(ActionTypes.ADD_ANOTHER_COMMENT);