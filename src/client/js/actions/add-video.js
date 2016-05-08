import { createAction } from 'redux-actions';

/**
 * Action Type constants
 */

export const ActionTypes = {
  SET_SOURCE: 'addVideo/SET_SOURCE',
  UNLOAD: 'addVideo/UNLOAD'
};

/**
 * Action creators
 */

export const setSource = createAction(ActionTypes.SET_SOURCE, videoLocationType => ({ videoLocationType }));
export const unload = createAction(ActionTypes.UNLOAD);