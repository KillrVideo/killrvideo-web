import { combineReducers } from 'redux';

import details from './details';
import comments from './comments';
import addedComments from './added-comments';
import moreLikeThis from './more-like-this';
import rating from './rating';

const viewVideo = combineReducers({
  details,
  comments,
  addedComments,
  moreLikeThis,
  rating
});

export default viewVideo;