const COOKIE_NAME = 'authToken';

/**
 * Simple class for wrapping the current express request that provides some convenience methods
 * for retrieving the current user.
 */
class RequestContext {
  constructor(request, response) {
    this.request = request;
    this.response = response;
  }
  
  getUserId() {
    // User id is stored in the auth cookie
    return this.request.cookies[COOKIE_NAME];
  }
  
  setUserId(userId) {
    // Just use the user Id as the auth token (obviously not something we would do in production)
    this.response.cookie(COOKIE_NAME, userId);
  }
  
  clearUserId() {
    this.response.clearCookie(COOKIE_NAME);
  }
}

export default RequestContext;