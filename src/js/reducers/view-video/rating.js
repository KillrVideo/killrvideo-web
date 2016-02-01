import { ActionTypes } from 'actions/view-video/rating';

const defaultRatingState = {
  _inProgressRating: null,
  currentUserRating: -1,
  ratingEnabled: false
};

function rating(state = defaultRatingState, action) {
  switch (action.type) {
    case ActionTypes.GET_CURRENT_USER_RATING.LOADING:
      return defaultRatingState;
      
    case ActionTypes.GET_CURRENT_USER_RATING.SUCCESS:
      return {
        ...state,
        currentUserRating: action.payload.rating,
        ratingEnabled: action.payload.rating === 0
      };
      
    case ActionTypes.GET_CURRENT_USER_RATING.FAILURE:
      return defaultRatingState;
    
    case ActionTypes.RATE_VIDEO.LOADING:
      return {
        ...state,
        _inProgressRating: action.payload.rating,
        ratingEnabled: false
      };
      
    case ActionTypes.RATE_VIDEO.SUCCESS:
      return {
        ...state,
        _inProgressRating: null,
        currentUserRating: state._inProgressRating
      };
      
    case ActionTypes.RATE_VIDEO.FAILURE:
      return {
        ...state,
        _inProgressRating: null,
        ratingEnabled: true
      };
  }
  
  return state;
}

export default rating;