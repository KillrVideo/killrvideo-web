const COOKIE_NAME = 'authToken';

/**
 * Simple class for getting/setting the currently logged in user id using cookies.
 */
class UserContext {
  constructor(request, response) {
    this.req = request;
    this.res = response;
  }
  
  getCurrentUserId() {
    // User id is stored in the auth cookie
    return this.req.cookies[COOKIE_NAME];
  }
  
  setCurrentUserId(userId) {
    // Just use the user Id as the auth token (obviously not something we would do in production)
    this.res.cookie(COOKIE_NAME, userId);
  }
  
  clearCurrentUserId() {
    this.res.clearCookie(COOKIE_NAME);
  }
}

export default UserContext;