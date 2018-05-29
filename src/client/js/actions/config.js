import { createAction } from 'redux-actions';

export const ActionTypes = {
  SET_CONFIG: 'config/SET'
};

export const setConfig = createAction(ActionTypes.SET_CONFIG, config => {
  // Do some validation that we got any required configuration options
  if (typeof config !== 'object' || config === null) {
    throw new Error('Invalid client config object');
  }
  //Validate the youTubeApiKey is a string
  if (typeof config['youTubeApiKey'] !== 'string') {
    throw new Error('You must specify the youTubeApiKey on client config');
  }
  
  return { config };
});