import Promise from 'bluebird';
import { isUndefined } from 'lodash';
import loadScript from 'load-script';
import model from 'stores/falcor-model';

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

// Create a promise for getting the YouTube API key from the server
function getApiKey() {
  return model.get([ 'configuration', 'youTubeApiKey' ]).then(response => {
    if (isUndefined(response)) throw new Error('Could not load YouTube API key');
    return response.json.configuration.youTubeApiKey;
  });
}

// Only load the YouTube client once
let getYouTubeClientPromise = null;
function getYouTubeClient() {
  if (getYouTubeClientPromise !== null) {
    return getYouTubeClientPromise;
  }
  
  getYouTubeClientPromise = Promise.join(loadYouTubeClient(), getApiKey(), (client, apiKey) => {
    client.setApiKey(apiKey);
    return client.load('youtube', 'v3').then(() => client.youtube);
  });
  return getYouTubeClientPromise;
};

// Return a promise with an authenticated client
export default getYouTubeClient;