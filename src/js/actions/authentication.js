import { createAction } from 'redux-actions';
import { createActionTypeConstants } from './promises';
import model from 'stores/falcor-model';
import { pluck, isUndefined } from 'lodash';
import { Promise } from 'lib/promise';

/**
 * Public action constants
 */

const LOGIN = 'authentication/LOGIN';
const LOGOUT = 'authentication/LOGOUT';
const GET_CURRENT_USER = 'authentication/GET_CURRENT_USER';
const REGISTER = 'authentication/REGISTER';

export const ActionTypes = {
  LOGIN: createActionTypeConstants(LOGIN),
  LOGIN_RESET: 'authentication/LOGIN_RESET',
  
  LOGOUT: createActionTypeConstants(LOGOUT),
  
  GET_CURRENT_USER: createActionTypeConstants(GET_CURRENT_USER),
  
  REGISTER: createActionTypeConstants(REGISTER),
  REGISTER_RESET: 'authentication/REGISTER_RESET'
};

/**
 * Public action creators
 */

// Reset the login UI
export const loginReset = createAction(ActionTypes.LOGIN_RESET);

// The array of default attributes to get from the current user when logging in or registering
const defaultUserAttributes = [ 'userId', 'firstName', 'lastName', 'email' ];

// Log a user in
export function login(email, password) {
  return dispatch => {
    // Make the request
    const promise = model.call('currentUser.login', [ email, password ], defaultUserAttributes)
      .then(
        response => response.json.currentUser, 
        errors => Promise.reject(pluck(errors, 'value'))
      );
      
    dispatch({
      type: LOGIN,
      payload: {
        promise,
        data: { promise }
      }
    });
    
    return promise;
  };
};

// Log the current user out
export function logout() {
  return dispatch => {
    // Make the falcor request
    const promise = model.call('currentUser.logout')
      .then(null, errors => Promise.reject(pluck(errors, 'value')));
    
    dispatch({
      type: LOGOUT,
      payload: {
        promise,
        data: { promise }
      }
    });
    
    return promise;
  };
};

// Get information about the currently logged in user
export function getCurrentUser(queries) {
  return dispatch => {
    const falcorQueries = queries.map(q => [ 'currentUser', ...q ]);
    
    const promise = model.get(...falcorQueries)
      .then(response => { return isUndefined(response) ? null : response.json.currentUser; });
      
    dispatch({
      type: GET_CURRENT_USER,
      payload: {
        promise,
        data: { promise }
      }
    });
    
    return promise;
  };
};

// Reset the user registration UI
export const registerReset = createAction(ActionTypes.REGISTER_RESET);

// Register a new user
export function register(firstName, lastName, email, password) {
  return dispatch => {
    // Make falcor request and handle results
    const promise = model.call('currentUser.register', [ firstName, lastName, email, password ], defaultUserAttributes)
      .then(
        response => response.json.currentUser,
        errors => Promise.reject(pluck(errors, 'value'))
      );
      
    dispatch({
      type: REGISTER,
      payload: {
        promise,
        data: { promise }
      }
    });
    
    return promise;
  };
};