/**
 * Express middleware for handling errors. 
 */
export function handleErrors() {
  return (err, req, res, next) => {
    // Delegate to default handler if response already in progress
    if (res.headersSent) {
      return next(err);
    }
    
    res.sendStatus(500);
  };
};