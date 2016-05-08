import { pipe, prop, prepend, append, of as toArray } from 'ramda';
import { SEARCH_SERVICE } from '../services/search';
import { uuidToString, timestampToDateString } from '../utils/protobuf-conversions';
import { toRef, toAtom } from './common/sentinels';
import { createPropPicker } from './common/props';
import * as Common from './common';

const videosMap = {
  'videoId': pipe(prop('videoId'), uuidToString),
  'addedDate': pipe(prop('addedDate'), timestampToDateString),
  'author': pipe(prop('userId'), uuidToString, toArray, prepend('usersById'), toRef),
  'stats': pipe(prop('videoId'), uuidToString, toArray, prepend('videosById'), append('stats'), toRef)
};
const pickVideoProps = createPropPicker(videosMap);

const suggestionsMap = {
  'suggestions': pipe(prop('suggestions'), toAtom)
};
const pickSuggestions = createPropPicker(suggestionsMap);

// Routes served by the search service
const routes = [
  {
    // Reference point for search results list
    route: 'search[{keys:terms}].results',
    get: Common.listReferenceWithDummyToken()
  },
  {
    // Video search results
    route: 'search[{keys:terms}].resultsList[{keys:startingVideoTokens}][{ranges:indexRanges}]["videoId", "addedDate", "name", "previewImageLocation", "author", "stats"]',
    get: Common.pagedServiceRequest(
      path => ({ query: path[1] }),
      SEARCH_SERVICE,
      (req, client) => { return client.searchVideosAsync(req); },
      pickVideoProps
    )
  },
  {
    // Search term suggestions as an atom
    route: 'search[{keys:terms}].suggestions',
    get: Common.serviceRequest(
      path => ({ query: path[1], pageSize: 5 }),
      SEARCH_SERVICE,
      (req, client) => { return client.getQuerySuggestionsAsync(req); },
      pickSuggestions
    )
  }
];

export default routes;