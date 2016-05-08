import Uri from 'jsuri';
import { isUndefined } from 'lodash';

/**
 * Tries to parse the given URL string and returns the YouTube video Id if the URL is a valid
 * YouTube video URL. Returns undefined if not a valid video URL.
 */
export default function parseYouTubeVideoId(urlString) {
  try {
    const url = new Uri(urlString);
    const protocol = url.protocol(); 
    if (protocol !== 'http' && protocol !== 'https') {
      return;
    }
    
    const host = url.host();
    let videoId;
    switch (host) {
      case 'www.youtube.com':
        // Use the v=XXX part of the query string
        videoId = url.getQueryParamValue('v');
        if (!videoId) return;
        break;
      case 'youtu.be':
        // Remove the slash prefix from the path
        videoId = url.path().slice(1);
        break;
      default:
        return;
    }
    
    return videoId.length > 0 ? videoId : undefined;
  } catch (e) {
    return;
  }
};