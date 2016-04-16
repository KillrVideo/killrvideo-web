import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import Promise from 'bluebird';
import { UPLOADS_SERVICE } from '../services/uploads';
import { uuidToString, stringToUuid } from '../utils/protobuf-conversions';
import { flattenPathValues, getIndexesFromRanges, groupIndexesByPagingState } from '../utils/falcor-utils';
import { logger } from '../utils/logging';

// Routes served by the uploads service
const routes = [
  {
    // Generate a URL where a video file can be uploaded to
    route: 'uploads.generateDestination',
    call(callPath, args) {
      // TODO: Need to take another look at upload routes in the client and also provide a route and call it from
      // the client to mark an upload as complete
      throw new Error('Not implemented');
    }
  }
];

export default routes;