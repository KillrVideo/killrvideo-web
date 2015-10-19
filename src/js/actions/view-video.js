import createAction from 'redux-actions/lib/createAction';
import model from 'stores/falcor-model';
import { first, values } from 'lodash';

export const VIEW_VIDEO_REQUESTED = 'VIEW VIDEO_REQUESTED';
export const VIEW_VIDEO_RECEIVED = 'VIEW_VIDEO_RECEIVED';

const viewVideoRequested = createAction(VIEW_VIDEO_REQUESTED, falcorQueries => ({ falcorQueries }));
const viewVideoReceived = createAction(VIEW_VIDEO_RECEIVED, video => ({ video }));

export function getVideo(falcorQueries) {
  return dispatch => {
    // Tell the UI we're loading
    dispatch(viewVideoRequested(falcorQueries));
    
    // Do the falcor query and then dispatch the results
    return model.get(...falcorQueries).then(response => {
      dispatch(viewVideoReceived(first(values(response.json.videosById))));
    });
  };
};