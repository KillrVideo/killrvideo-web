import { combineReducers } from 'redux';
import { createPagedReducer } from './paged';

const PAGING_CONFIG = {
  recordsPerPage: 5,
  incrementIndexPerPage: 4,
  recordsPerRequest: 10
};

const recentVideos = createPagedReducer('recentVideos', PAGING_CONFIG);
const recommendedVideos = createPagedReducer('recommendedVideos', PAGING_CONFIG);
const myVideos = createPagedReducer('myVideos', PAGING_CONFIG);

// Export reducer
export default combineReducers({
  recentVideos,
  recommendedVideos,
  myVideos
});