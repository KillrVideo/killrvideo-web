import { createPagedReducer } from '../paged';

// Create reducer for showing comments
const COMMENTS_LIST_ID = 'videoComments';
const COMMENTS_PAGING_CONFIG = {
  recordsPerPage: 5,
  recordsPerRequest: 10
};

const comments = createPagedReducer(COMMENTS_LIST_ID, COMMENTS_PAGING_CONFIG);

// Export reducer
export default comments;