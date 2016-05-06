import { ActionTypes } from 'actions/config';

const defaultConfig = {
  chatEnabled: false
};

function configReducer(state = defaultConfig, action) {
  switch (action.type) {
    // Merge config provided into any existing config
    case ActionTypes.SET_CONFIG:
      let config = action.payload.config;
      return {
        ...state,
        ...config
      };
  }
  
  return state;
}

export default configReducer;