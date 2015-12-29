import { createAction } from 'redux-actions';

/**
 * Public action type constants
 */
export const ActionTypes = {
  CHANGE_DETAILS_VISIBILITY: 'addVideo/changeDetailsVisibility'
};

/**
 * Private action creators
 */

const changeDetailsVisibility = createAction(ActionTypes.CHANGE_DETAILS_VISIBILITY, visible => ({ visible }));


/**
 * Public action creators
 */

export function showCommonDetails() { return changeDetailsVisibility(true); }
export function hideCommonDetails() { return changeDetailsVisibility(false); }
