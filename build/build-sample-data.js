var gulp = require('gulp');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var moment = require('moment');
var EOL = require('os').EOL;
var $ref = require('falcor').Model.ref;

// Some constants
var OUTPUT_FILE_NAME = 'sample-data-cache.js';
var OUTPUT_FOLDER = './src/js/stores';

// Generate a cache for a Falcor Model from sample data files
gulp.task('sample-data', function(cb) {
  // Sample data JSON
  var videos = require('../data/videos.json');
  var users = require('../data/users.json');
  
  // Start by creating indexes by key
  var jsonGraph = {
    usersById: _.indexBy(users, 'userId'), 
    videosById: _.indexBy(videos, 'videoId')
  };
  
  // Add some video projections
  jsonGraph.recentVideos = _(videos)
    .sortByOrder(function(val) {
      return moment(val.addedDate).toDate();
    }, 'desc')
    .take(9)
    .reduce(function(acc, val, idx) {
      acc[idx] = $ref('videosById["' + val.videoId + '"]');
      return acc;
    }, {});
  
  // Give the videos a reference to a user
  _.forEach(jsonGraph.videosById, function(video) {
    var idx = parseInt('0x' + video.videoId.substr(0, 1)) % users.length;
    video.author = $ref('usersById["' + users[idx].userId + '"]');
  });
  
  // Output the file
  var output = path.join(OUTPUT_FOLDER, OUTPUT_FILE_NAME);
  var stream = fs.createWriteStream(output);
  stream.once('open', function() {
    stream.write('// Automatically generated from the "sample-data" gulp task' + EOL);
    stream.write('const cache = ');
    stream.write(JSON.stringify(jsonGraph, null, 2));
    stream.write(';' + EOL);
    stream.write('export default cache;' + EOL);
    stream.end();
    cb();
  });
});