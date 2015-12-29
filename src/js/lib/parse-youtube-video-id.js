import { parse } from 'url';
import { isUndefined } from 'lodash';

/**
 * Tries to parse the given URL string and returns the YouTube video Id if the URL is a valid
 * YouTube video URL. Returns undefined if not a valid video URL.
 */
export default function parseYouTubeVideoId(urlString) {
  try {
    let url = parse(urlString, true);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return;
    }
    
    let videoId;
    switch (url.hostname) {
      case 'www.youtube.com':
        // Use the v=XXX part of the query string
        if (isUndefined(url.query.v)) return;
        videoId = url.query.v;
        break;
      case 'youtu.be':
        // Remove the slash prefix from the path
        videoId = url.pathname.slice(1);
        break;
      default:
        return;
    }
    
    return videoId.length > 0 ? videoId : undefined;
  } catch (e) {
    return;
  }
};