import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import { getIndexesFromRanges } from './util';
import { _, isUndefined } from 'lodash';

import getVideos from '../data/videos';

// Index the sample videos by tag
const videoIdsByTag = _(getVideos()).reduce((acc, video) => {
  // For each tag, add the video to the index for that tag
  video.tags.forEach(tag => {
    if (isUndefined(acc[tag])) {
      acc[tag] = [];
    }
    acc[tag].push(video.videoId);
  });
  
  return acc;
}, {});

/**
 * The routes for searching videos
 */
const routes = [
  {
    route: 'search[{keys:terms}][{ranges:indexRanges}]',
    get(pathSet) {
      let pathValues = [];
      
      pathSet.terms.forEach(term => {
        // Term will be something like 'query=What to search for'
        const [ , query ] = term.split('=');
        
        const videosForQuery = videoIdsByTag[query];
        getIndexesFromRanges(pathSet.indexRanges).forEach(idx => {
          pathValues.push({
            path: [ 'search', term, idx ],
            value: isUndefined(videosForQuery) || idx >= videosForQuery.length ? $atom() : $ref([ 'videosById', videosForQuery[idx] ])
          });
        });
      });
      
      return pathValues;
    }
  }
];

// Export the routes
export default routes;