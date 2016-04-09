import express from 'express';
import { Server } from 'http';
import { dataSourceRoute } from 'falcor-express';
import bodyParser from 'body-parser';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import SocketIO from 'socket.io';

import KillrVideoRouter from './router';
import { handleConnection } from './chat-handler';
import RequestContext from './request-context';
import config from 'config';

// Create the server
const app = express();

// Serve up static build assets
app.use('/static', express.static(`${__dirname}/resources/static`));

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
  res.sendFile(`${__dirname}/resources/static/server.html`);
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

// Create the server
const http = Server(app);

// Listen for websocket connections
const io = SocketIO(http);
io.on('connection', handleConnection);

// Start the server
http.listen(listenPort, () => {
  const address = http.address();
  console.log(`Listening at http://${address.address}:${address.port}`);
});