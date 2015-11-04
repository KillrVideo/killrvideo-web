import express from 'express';
import { dataSourceRoute } from 'falcor-express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

import KillrVideoRouter from './router';
import UserContext from './lib/user-context';

// Create a server for use during development
const app = express();

// Serve up static build assets
app.use('/static', express.static(`${__dirname}/../dist`));

// Parse POST body for requests to falcor endpoint
app.use(bodyParser.urlencoded({ extended: false }));

// Cookies for auth
app.use(cookieParser());

// Model.json endpoint for Falcor requests
app.use('/model.json', dataSourceRoute((req, res) => {
  let userContext = new UserContext(req, res);
  return new KillrVideoRouter(userContext);
}));

// All other requests serve up the server.html page 
app.get('/*', (req, res) => {
  res.sendFile(`${__dirname}/server.html`);
});

// Log errors
app.use((err, req, res, next) => {
  console.error(err);
  next(err);
});

// Start the server
const server = app.listen(process.env.PORT || 3000, function() {
  const host = server.address().address;
  const port = server.address().port;

  console.log(`Listening at http://${host}:${port}`);
});