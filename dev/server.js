import express from 'express';
import { dataSourceRoute } from 'falcor-express';
import bodyParser from 'body-parser';
import session from 'express-session';
import cookieParser from 'cookie-parser';

import KillrVideoRouter from './router';
import RequestContext from './request-context';

// Create a server for use during development
const app = express();

// Serve up static build assets
app.use('/static', express.static(`${__dirname}/../dist`));

// Dummy upload file endpoint
app.put('/dummyUploadEndpoint/*', (req, res) => res.sendStatus(201));

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
  console.error(err);
  next(err);
});

// Start the server
const server = app.listen(process.env.PORT || 3000, function() {
  const host = server.address().address;
  const port = server.address().port;

  console.log(`Listening at http://${host}:${port}`);
});