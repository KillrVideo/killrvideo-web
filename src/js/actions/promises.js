/**
 * The suffixes used with the redux-promise-middleware for dispatching promise actions
 */
export const promiseTypeSuffixes = [
  'LOADING', 'SUCCESS', 'FAILURE'
];

/**
 * Helper function that returns an object with LOADING, SUCCESS, and FAILURE string properties
 * whose values can be used in reducers to respond to the different stages of promise actions 
 * for the given actionType.
 */
export function createActionTypeConstants(actionType) {
  return {
    LOADING: `${actionType}_${promiseTypeSuffixes[0]}`,
    SUCCESS: `${actionType}_${promiseTypeSuffixes[1]}`,
    FAILURE: `${actionType}_${promiseTypeSuffixes[2]}`
  };
};