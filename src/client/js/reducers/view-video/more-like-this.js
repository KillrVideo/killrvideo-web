import { createPagedReducer } from '../paged';

// Create reducer for showing similar videos
const MORE_LIKE_THIS_LIST_ID = 'moreLikeThis';
const MORE_LIKE_THIS_PAGING_CONFIG = {
  recordsPerPage: 5,
  incrementIndexPerPage: 4,
  recordsPerRequest: 20
};

const moreLikeThis = createPagedReducer(MORE_LIKE_THIS_LIST_ID, MORE_LIKE_THIS_PAGING_CONFIG);

export default moreLikeThis;