import { store } from 'stores/redux-store';
import { getIsLoggedIn } from 'actions/authentication';
import { Promise } from 'lib/promise';

/**
 * Function for use in a route's onEnter hook that will verify a user if authenticated before proceeding and if not,
 * will redirect to the sign in page.
 */
export function checkAuthentication(nextState, replace, cb) {
  // See if user is authenticated
  let { authentication: { currentUser: { isLoggedIn } } } = store.getState();
  
  const isLoggedInPromise = isLoggedIn !== null
    ? Promise.resolve(isLoggedIn)
    : store.dispatch(getIsLoggedIn())
        .then(() => {
          // See if they are logged in after asking the server for their userId
          const { authentication: { currentUser: { isLoggedIn: isLoggedInFromServer } } } = store.getState();
          return isLoggedInFromServer;
        })
        .catchReturn(false);
  
  isLoggedInPromise.then(loggedIn => {
    if (loggedIn === false) {
      // Send them to the sign in page and remember where they were trying to go
      replace({
        pathname: '/account/signin',
        state: { 
          redirectAfterLogin: {
            pathname: nextState.location.pathname,
            search: nextState.location.search
          }
        }
      });
    }
  })
  .then(cb);
};

export default checkAuthentication;