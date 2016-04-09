import express from 'express';
import { createServer } from 'http';
import { dataSourceRoute } from 'falcor-express';
import bodyParser from 'body-parser';
import session from 'express-session';
import SocketIO from 'socket.io';
import morgan from 'morgan';

import { logErrors } from './middleware/log-errors';
import { handleErrors } from './middleware/handle-errors';
import KillrVideoRouter from './router';
import { handleConnection } from './chat-handler';
import RequestContext from './request-context';
import config from 'config';
import { logger } from './utils/logging';

// Create the server
const app = express();

// Serve up static build assets
app.use('/static', express.static(`${__dirname}/resources/static`));

// Request logging when in development
if (app.get('env') === 'development') {
  app.use(morgan('dev'));
}

// Parse POST body for requests to falcor endpoint
app.use(bodyParser.urlencoded({ extended: false }));

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

// Error handlers
app.use(logErrors());
app.use(handleErrors());

// Create the server
const server = createServer(app);

// Attach some logging to start/stop
server.on('listening', () => {
  logger.log('info', 'KillrVideo Web Server listening on %j', server.address());
});
server.on('close', () => {
  logger.log('info', 'KillrVideo Web Server is closed');
});

// Listen for websocket connections
const io = SocketIO(server);
io.on('connection', handleConnection);

// Start the server
const listenPort = process.env.PORT || 3000;
server.listen(listenPort);