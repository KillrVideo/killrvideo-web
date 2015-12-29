import Promise from 'bluebird';
import { isUndefined } from 'lodash';
import loadScript from 'load-script';

const youTubeLoaded = new Promise(resolve => {
  if (isUndefined(global.YT) || isUndefined(global.YT.Player)) {
    // Add listener on global object for when YouTube API is ready
    global.onYouTubeIframeAPIReady = function() {
      resolve(global.YT);
    };
    
    // Load the script and append to the <head> element of the document
    loadScript('//www.youtube.com/iframe_api');
  } else {
    resolve(global.YT);
  }
});

// Export promise that will be resolved once YouTube Player API is available
export default youTubeLoaded;