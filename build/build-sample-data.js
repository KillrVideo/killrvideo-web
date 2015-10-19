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
  
  // Give each video a number of views
  _.forEach(jsonGraph.videosById, function(video) {
    var last10 = video.videoId.substr(video.videoId.length - 11, 10);
    video.views = parseInt('0x' + last10) % 10000; 
  });
  
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
  
  jsonGraph.videoRatingsById = _.mapValues(jsonGraph.videosById, function(video) {
    // Use last 5 "digits" of video id as the number of 1...5 star ratings where each "digit" is the number of ratings for a given  
    // star level (i.e. the last "digit" is the number of 5 star ratings, second to last is number of 4 star ratings, etc)
    var last5 = video.videoId.substr(video.videoId.length - 6, 5).split('');
    return _.reduce(last5, function(acc, val, idx) {
      var count = parseInt('0x' + val);
      var total = (idx + 1) * count;
      acc.count += count;
      acc.total += total;
      return acc;
    }, { count: 0, total: 0 });
  });
  
  // Give the videos some references
  _.forEach(jsonGraph.videosById, function(video) {
    // Give a reference to an author in usersById
    var idx = parseInt('0x' + video.videoId.substr(0, 1)) % users.length;
    video.author = $ref('usersById["' + users[idx].userId + '"]');
    
    // Give a reference to ratings information in videoRatingsById
    video.rating = $ref('videoRatingsById["' + video.videoId + '"]');
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