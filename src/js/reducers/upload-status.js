import moment from 'moment';
import { ActionTypes } from 'actions/upload-status';

// Default state
const defaultState = {
  _promise: null,
  
  status: 'Queued',
  statusStyle: 'info',
  statusDate: null,
  location: null
};

// Reducer for upload status
function uploadStatus(state = defaultState, action) {
  const p = state._promise;
  
  switch (action.type) {
    case ActionTypes.MONITOR.LOADING:
      if (p !== null) p.cancel();
      
      return {
        ...defaultState,
        _promise: action.payload.promise,
        statusDate: moment().fromNow()
      };
      
    case ActionTypes.MONITOR.FAILURE:
      return {
        ...state,
        _promise: null,
        statusStyle: 'danger'
      };
      
    case ActionTypes.MONITOR.SUCCESS:
      return {
        ...state,
        _promise: null,
        statusStyle: 'success',
        location: action.payload.location
      };
      
    case ActionTypes.CHANGED:
      return {
        ...state,
        status: action.payload.status,
        statusDate: moment(action.payload.statusDate).fromNow()
      };
    
    case ActionTypes.UNLOAD:
      if (p !== null) p.cancel();
      return defaultState;
  }
  return state;
}

// Export the reducer
export default uploadStatus;