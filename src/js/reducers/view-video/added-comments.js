import { ActionTypes } from 'actions/view-video/added-comments';

const defaultAddedComments = {
  isLoading: false,
  commentAdded: false,
  comments: []
};

function addedComments(state = defaultAddedComments, action) {
  switch (action.type) {
    case ActionTypes.ADD_COMMENT_RESET:
      return defaultAddedComments;
      
    case ActionTypes.ADD_COMMENT.LOADING:
      return {
        ...state,
        isLoading: true
      };
      
    case ActionTypes.ADD_COMMENT.SUCCESS:
      return {
        isLoading: false,
        commentAdded: true,
        comments: [ action.payload, ...state.comments ]
      };
      
    case ActionTypes.ADD_COMMENT.FAILURE:
      return {
        ...state,
        isLoading: false
      };
      
    case ActionTypes.ADD_ANOTHER_COMMENT:
      return {
        ...state,
        commentAdded: false
      };
  }
  
  return state;
}

// Export reducer
export default addedComments;