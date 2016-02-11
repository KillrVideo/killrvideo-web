import express from 'express';
import vhost from 'vhost';
import cors from 'cors';
import { dataSourceRoute } from 'falcor-express';
import bodyParser from 'body-parser';
import session from 'express-session';
import cookieParser from 'cookie-parser';

import KillrVideoRouter from './router';
import RequestContext from './request-context';
import config from './config';

// Create an app that will run on a separate domain for simulating CORS uploads
const uploadApp = express();

// Allow CORS pre-flight options call
uploadApp.options('/dummyUploadEndpoint/:fileName', cors());

// Dummy upload file endpoint
uploadApp.put('/dummyUploadEndpoint/:fileName', cors(), (req, res) => {
  // Quick way to simulate failures
  if (req.params.fileName === 'Wildlife.wmv') {
    res.sendStatus(500);
  } else {
    res.sendStatus(201);
  }
});

// Create a server for use during development
const app = express();

// Run upload app on different domain
app.use(vhost(config.uploadEndpointHost, uploadApp));

// Serve up static build assets
app.use('/static', express.static(`${__dirname}/../dist`));

// Parse POST body for requests to falcor endpoint
app.use(bodyParser.urlencoded({ extended: false }));

// Cookie parser for auth
app.use(cookieParser());

// Session for simulating some server-side state if necessary
app.use(session({ secret: 'KillrVideo Web', saveUninitialized: false, resave: false }));

// Model.json endpoint for Falcor requests
app.use('/model.json', dataSourceRoute((req, res) => {
  return new KillrVideoRouter(new RequestContext(req, res));
}));

// All other requests serve up the server.html page 
app.get('/*', (req, res) => {
  res.sendFile(`${__dirname}/server.html`);
});

// Log errors
app.use((err, req, res, next) => {
  console.log('Error handler!');
  console.error(err);
  next(err);
});

// Figure out port and store as local
const listenPort = process.env.PORT || 3000;
app.locals.port = listenPort;

// Start the server
const server = app.listen(listenPort, function() {
  const host = server.address().address;
  const port = server.address().port;

  console.log(`Listening at http://${host}:${port}`);
});