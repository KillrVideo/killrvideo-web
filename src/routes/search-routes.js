import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import Promise from 'bluebird';
import { getClientAsync } from '../services/search';
import { uuidToString, stringToUuid } from '../utils/protobuf-conversions';
import { flattenPathValues, getIndexesFromRanges, groupIndexesByPagingState } from '../utils/falcor-utils';
import { logger } from '../utils/logging';

// Routes served by the search service
const routes = [
  {
    // Search for videos
    route: 'search[{keys:terms}][{ranges:indexRanges}]["videoId", "addedDate", "name", "previewImageLocation", "author", "stats"]',
    get(pathSet) {
      const searchPromises = pathSet.queries.map(term => {
        // Term will be something like 'query=What to search for'
        const [ , query ] = term.split('=');
        
        // TODO: Search
        throw new Error('Not implemented');
      });
      
      return Promise.all(searchPromises).then(flattenPathValues);
    }
  },
  {
    // Get search term suggestions
    route: 'searchSuggestions[{keys:terms}].suggestions',
    get(pathSet) {
      // TODO: Suggestions as atom array
      throw new Error('Not implemented');
    }
  }
];

export default routes;