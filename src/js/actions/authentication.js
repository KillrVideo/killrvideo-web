import createAction from 'redux-actions/lib/createAction';
import model from 'stores/falcor-model';
import { pluck } from 'lodash';

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

/**
 * Public action creators
 */
export const loginReset = createAction(LOGIN_RESET);
export function login(email, password) {
  return dispatch => {
    // Tell UI we're attempting to login
    dispatch(loginRequest());
    
    // Make the request
    return model.call('authentication.login', [ email, password ], [ 'userId', 'firstName', 'lastName', 'email' ]).then(response => {
      return dispatch(loginSuccess(response.json.authenticaiton.currentUser));
    }, errors => {
      return dispatch(loginFailure(pluck(errors, 'value')));
    });
  };
};

export function logout() {
  return dispatch => {
    // Tell UI we're logging out
    dispatch(logoutRequest());
    
    // Make the falcor request
    return model.call('authentication.logout').then(response => dispatch(logoutSuccess()), errors => dispatch(logoutFailure(pluck(errors, 'value'))));
  };
};

export function getCurrentUser(queries) {
  return dispatch => {
    const falcorQueries = queries.map(q => [ 'authentication', 'currentUser', ...q ]);
    
    // Tell UI we're getting the current user
    dispatch(requestCurrentUser(falcorQueries));
    
    // Do the request and dispatch the response
    return model.get(...falcorQueries).then(response => dispatch(receiveCurrentUser(response.json.authentication.currentUser)));
  };
};
