import express from 'express';
import { dataSourceRoute } from 'falcor-express';
import KillrVideoRouter from './router';

// Create a server for use during development
const app = express();

// Serve up static build assets
app.use('/static', express.static(`${__dirname}/../dist`));

app.use('/model.json', dataSourceRoute((req, res) => new KillrVideoRouter()));

// All other requests serve up the server.html page 
app.get('/*', function(req, res) {
  res.sendFile(`${__dirname}/server.html`);
});

// Start the server
const server = app.listen(process.env.PORT || 3000, function() {
  const host = server.address().address;
  const port = server.address().port;

  console.log(`Listening at http://${host}:${port}`);
});