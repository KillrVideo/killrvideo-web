import { createAction } from 'redux-actions';

/**
 * Action type constants
 */

export const ActionTypes = {
  SET_SOURCE: 'addVideo/setSource',
  SET_COMMON_DETAILS_VISIBILITY: 'addVideo/setCommonDetailsVisibility',
  ADD_SUCCESSFUL: 'addVideo/addSucessful'
};

/**
 * Public action creators
 */

export const setSource = createAction(ActionTypes.SET_SOURCE, videoLocationType => ({ videoLocationType }));
export const showCommonDetails = createAction(ActionTypes.SET_COMMON_DETAILS_VISIBILITY, () => ({ showCommonDetails: true }));
export const hideCommonDetails = createAction(ActionTypes.SET_COMMON_DETAILS_VISIBILITY, () => ({ showCommonDetails: false }));
export const addSuccessful = createAction(ActionTypes.ADD_SUCCESSFUL, addedVideoId => ({ addedVideoId }));