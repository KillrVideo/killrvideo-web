import { createAction } from 'redux-actions';
import model from 'stores/falcor-model';
import { pluck, isUndefined } from 'lodash';

/**
 * Public action constants
 */
export const LOGIN_RESET = 'LOGIN_RESET';
export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_FAILURE = 'LOGIN_FAILURE'
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';

export const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const LOGOUT_FAILURE = 'LOGOUT_FAILURE';

export const REQUEST_CURRENT_USER = 'REQUEST_CURRENT_USER';
export const RECEIVE_CURRENT_USER = 'RECEIVE_CURRENT_USER';

export const REGISTER_RESET = 'REGISTER_RESET';
export const REGISTER_REQUEST = 'REGISTER_REQUEST';
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';
export const REGISTER_FAILURE = 'REGISTER_FAILURE';

/**
 * Private action creators
 */
const loginRequest = createAction(LOGIN_REQUEST);
const loginSuccess = createAction(LOGIN_SUCCESS, currentUser => ({ currentUser }));
const loginFailure = createAction(LOGIN_FAILURE, errors => ({ errors }));

const logoutRequest = createAction(LOGOUT_REQUEST);
const logoutSuccess = createAction(LOGOUT_SUCCESS);
const logoutFailure = createAction(LOGOUT_FAILURE, errors => ({ errors }));

const requestCurrentUser = createAction(REQUEST_CURRENT_USER, queries => ({ queries }));
const receiveCurrentUser = createAction(RECEIVE_CURRENT_USER, currentUser => ({ currentUser }));

const registerRequest = createAction(REGISTER_REQUEST);
const registerSuccess = createAction(REGISTER_SUCCESS, currentUser => ({ currentUser }));
const registerFailure = createAction (REGISTER_FAILURE, errors => ({ errors }));

/**
 * Public action creators
 */

// Reset the login UI
export const loginReset = createAction(LOGIN_RESET);

// The array of default attributes to get from the current user when logging in or registering
const defaultUserAttributes = [ 'userId', 'firstName', 'lastName', 'email' ];

// Log a user in
export function login(email, password) {
  return dispatch => {
    // Tell UI we're attempting to login
    dispatch(loginRequest());
    
    // Make the request
    return model.call('currentUser.login', [ email, password ], defaultUserAttributes).then(response => {
      return dispatch(loginSuccess(response.json.currentUser));
    }, errors => {
      return dispatch(loginFailure(pluck(errors, 'value')));
    });
  };
};

// Log the current user out
export function logout() {
  return dispatch => {
    // Tell UI we're logging out
    dispatch(logoutRequest());
    
    // Make the falcor request
    return model.call('currentUser.logout').then(response => {
      dispatch(logoutSuccess())
    }, errors => {
      console.error(errors)
    });
  };
};

// Get information about the currently logged in user
export function getCurrentUser(queries) {
  return dispatch => {
    const falcorQueries = queries.map(q => [ 'currentUser', ...q ]);
    
    // Tell UI we're getting the current user
    dispatch(requestCurrentUser(falcorQueries));
    
    // Do the request and dispatch the response
    return model.get(...falcorQueries).then(response => {
      return dispatch(receiveCurrentUser(isUndefined(response) ? null : response.json.currentUser));
    });
  };
};

// Reset the user registration UI
export const registerReset = createAction(REGISTER_RESET);

// Register a new user
export function register(firstName, lastName, email, password) {
  return dispatch => {
    // Tell UI we're trying to register
    dispatch(registerRequest());
    
    // Make falcor request and handle results
    return model.call('currentUser.register', [ firstName, lastName, email, password ], defaultUserAttributes).then(response => {
      dispatch(registerSuccess(response.json.currentUser));
    }, errors => {
      dispatch(registerFailure(pluck(errors, 'value')));
    });
  };
};