import { createAction } from 'redux-actions';
import { createActionTypeConstants } from './promises';
import { model } from 'stores/falcor-model';
import { map, isUndefined } from 'lodash';
import { Promise } from 'lib/promise';
import { throwAsReduxFormError } from 'lib/redux-form-error';

/**
 * Public action constants
 */

const LOGIN = 'authentication/LOGIN';
const LOGOUT = 'authentication/LOGOUT';
const GET_CURRENT_USER = 'authentication/GET_CURRENT_USER';
const REGISTER = 'authentication/REGISTER';

export const ActionTypes = {
  LOGIN: createActionTypeConstants(LOGIN),
  LOGOUT: createActionTypeConstants(LOGOUT),
  GET_CURRENT_USER: createActionTypeConstants(GET_CURRENT_USER),
  REGISTER: createActionTypeConstants(REGISTER),
};

/**
 * Public action creators
 */

// The array of default attributes to get from the current user when logging in or registering
const defaultUserAttributes = [ 'userId', 'firstName', 'lastName', 'email' ];

// Log a user in
export function login(email, password) {
  // Make the request
  const promise = model.call('currentUser.login', [ email, password ], defaultUserAttributes)
    .catch(throwAsReduxFormError)
    .then(response => response.json.currentUser);
      
  return {
    type: LOGIN,
    payload: {
      promise,
      data: { promise }
    }
  };
};

// Log the current user out
export function logout() {
  // Make the falcor request
  const promise = model.call('currentUser.logout')
    .catch(throwAsReduxFormError);
  
  return {
    type: LOGOUT,
    payload: {
      promise,
      data: { promise }
    }
  };
};

// Get information about the currently logged in user
export function getCurrentUser(queries) {
  const falcorQueries = queries.map(q => [ 'currentUser', ...q ]);
  
  const promise = model.get(...falcorQueries)
    .then(response => { return isUndefined(response) ? null : response.json.currentUser; });
    
  return {
    type: GET_CURRENT_USER,
    payload: {
      promise,
      data: { promise }
    }
  };
};

export function getIsLoggedIn() {
  return getCurrentUser([ [ 'userId' ] ]);
};

// Register a new user
export function register(firstName, lastName, email, password) {
  // Make falcor request and handle results
  const promise = model.call('currentUser.register', [ firstName, lastName, email, password ], defaultUserAttributes)
    .catch(throwAsReduxFormError)
    .then(response => response.json.currentUser);
      
  return {
    type: REGISTER,
    payload: {
      promise,
      data: { promise }
    }
  };
};