import { model } from 'stores/falcor-model';
import { createActionTypeConstants } from 'actions/promises';
import { createAction } from 'redux-actions';

const GET_VIDEO = 'viewVideo/GET_VIDEO';

export const ActionTypes = {
  GET_VIDEO: createActionTypeConstants(GET_VIDEO),
  RESET_VIDEO: 'viewVideo/RESET_VIDEO',
  UPDATE_VIDEO_LOCATION: 'viewVideo.UPDATE_VIDEO_LOCATION'
};

// Get video details
export function getVideo(videoQueries) {
  return (dispatch, getState) => {
    const { router: { params: { videoId } } } = getState();
    
    const queryRoot = [ 'videosById', videoId ];
    videoQueries = videoQueries.map(q => [ ...queryRoot, ...q ]);
    
    // Get the video and dispatch the promise
    const promise = model.get(...videoQueries)
      .then(response => response.json.videosById[videoId]);
      
    dispatch({
      type: GET_VIDEO,
      payload: { 
        promise,
        data: {
          promise
        } 
      }
    });
    
    return promise;
  }
};

// Reset the current video details
export const resetVideo = createAction(ActionTypes.RESET_VIDEO);

// Allow the video location to be updated (for ex, after waiting on an upload to finish processing)
export const updateVideoLocation = createAction(ActionTypes.UPDATE_VIDEO_LOCATION, location => ({ location }));