var express = require('express');

// Create a server for use during development
var app = express();

// Serve up static build assets
app.use('/build', express.static(__dirname + '/build'));

// All other requests serve up the index.html page 
app.get('/*', function(req, res) {
  res.sendFile(__dirname + '/server.html');
});

// Start the server
var server = app.listen(process.env.PORT || 3000, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Listening at http://%s:%s', host, port);
});