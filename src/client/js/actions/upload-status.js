import { createAction } from 'redux-actions';
import { model } from 'stores/falcor-model';
import { createActionTypeConstants } from './promises';
import { isUndefined } from 'lodash';
import { Promise } from 'lib/promise';

// Look for an update every 10 seconds
const UPDATE_INTERVAL = 10000;

/**
 * Action type constants
 */

const MONITOR = 'uploadStatus/MONITOR';

// Public action types
export const ActionTypes = {
  MONITOR: createActionTypeConstants(MONITOR),
  CHANGED: 'uploadStatus/CHANGED',
  UNLOAD: 'uploadStatus/UNLOAD'
};

/**
 * Private helpers
 */
const changed = createAction(ActionTypes.CHANGED, (status, statusDate) => ({ status, statusDate }));

function getStatus() {
  return model.get([ 'videosById', this.videoId, [ 'status', 'statusDate' ] ])
    .then(response => {
      // Get the status and let the UI know about it
      const v = response.json.videosById[this.videoId];
      if (v.status !== null && v.statusDate !== null) {
        this.dispatch(changed(v.status, v.statusDate));
      } 
            
      // Decide what to do
      switch(v.status) {
        case 'Canceled':
        case 'Error':
          return Promise.reject();
        
        case 'Finished':
          return;
          
        default:
          // Recursively get status until we end up in one of the completed states
          return Promise.bind(this).delay(UPDATE_INTERVAL).then(getStatus);
      }
    });
}

function waitForVideoLocation() {
  return model.get([ 'videosById', this.videoId, 'location' ]).then(response => {
    const location = response.json.videosById[this.videoId].location; 
    if (location) {
      return { location };
    }
    
    // Wait and try again
    return Promise.bind(this).delay(UPDATE_INTERVAL).then(waitForVideoLocation);
  });
}

/**
 * Action creators
 */

export function getStatusUpdates(videoId) {
  // Create a promise that will return the latest status
  const promise = Promise.bind({ dispatch, videoId }).then(getStatus).then(waitForVideoLocation);
    
  return dispatch({
    type: MONITOR,
    payload: { 
      promise,
      data: { promise } 
    }
  });
};

export const unload = createAction(ActionTypes.UNLOAD);