import Promise from 'lib/promise';
import { isUndefined } from 'lodash';
import loadScript from 'load-script';

// Create a promise for loading the Google JS client
function loadYouTubeClient() {
  return new Promise(resolve => {
    const api = global.gapi;
    if (isUndefined(api) || isUndefined(api.client) || isUndefined(api.client.request)) {
      // Define a callback on the global object and load the client JS
      global.handleGoogleApiLoaded = () => resolve(global.gapi.client);
      loadScript('//apis.google.com/js/client.js?onload=handleGoogleApiLoaded');
    } else {
      resolve(api.client);
    }
  });
}

// Only load the YouTube client once
let getYouTubeClientPromise = null;
export function getYouTubeClient(apiKey) {
  if (getYouTubeClientPromise !== null) {
    return getYouTubeClientPromise;
  }
  
  getYouTubeClientPromise = loadYouTubeClient().then(client => {
    client.setApiKey(apiKey);
    return client.load('youtube', 'v3').then(() => client.youtube);
  });
  return getYouTubeClientPromise;
};

// Return a promise with an authenticated client
export default getYouTubeClient;