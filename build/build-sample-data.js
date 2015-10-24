var gulp = require('gulp');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var moment = require('moment');
var EOL = require('os').EOL;
var falcorModel = require('falcor').Model;
var $ref = falcorModel.ref;
var $atom = falcorModel.atom;

// Some constants
var OUTPUT_FILE_NAME = 'sample-data-cache.js';
var OUTPUT_FOLDER = './src/js/stores';

// Sample data JSON
var videos = require('../data/videos.json');
var users = require('../data/users.json');
var comments = require('../data/comments.json');

// Helper function for generating an int from part of a UUID
function getIntFromPartOfUuid(uuid, startIdx, numChars, maxValue) {
  var hex = uuid.substr(startIdx, numChars);
  return parseInt('0x' + hex) % maxValue;
}

// Generate a number of views for a video based on the video Id
function generateViews(videoId) {
  return getIntFromPartOfUuid(videoId, videoId.length - 11, 10, 10000);
}

// Generate a reference to an author for a video based on the video id
function generateAuthorRef(videoId) {
  var authorIdx = getIntFromPartOfUuid(videoId, 0, 1, users.length);
  return $ref('usersById["' + users[authorIdx].userId + '"]');
}

// Generate ratings for a video based on the video id
function generateRating(videoId) {
  // Use last 5 "digits" of video id as the number of 1...5 star ratings where each "digit" is the number of ratings for a given  
  // star level (i.e. the last "digit" is the number of 5 star ratings, second to last is number of 4 star ratings, etc)
  var last5 = videoId.substr(videoId.length - 6, 5).split('');
  return _.reduce(last5, function(acc, val, idx) {
    var count = parseInt('0x' + val);
    var total = (idx + 1) * count;
    acc.count += count;
    acc.total += total;
    return acc;
  }, { count: 0, total: 0 });
}

// Generate a map of comments for a video based on the video id and the added date of the video
function generateComments(videoId, videoAddedDate) {
  // What index to start pulling comments from
  var commentIdx = getIntFromPartOfUuid(videoId, 1, 2, comments.length);
  
  // What index to start pulling users for the comment from
  var userIdx = getIntFromPartOfUuid(videoId, 3, 2, users.length);
  
  // How many comments to pull
  var numComments = getIntFromPartOfUuid(videoId, videoId.length - 3, 2, comments.length);
  
  var commentsForVideo = {};
  for(var i = 0; i < numComments; i++) {
    var idxInCommentsList = (commentIdx + i) % comments.length;
    var idxInUsersList = (userIdx + i) % users.length;
    
    commentsForVideo[i] = {
      comment: comments[idxInCommentsList],
      addedDate: moment(videoAddedDate).add(i, 'days').toISOString(),
      author: $ref('usersById["' + users[idxInUsersList].userId + '"]')
    };
  }
  return commentsForVideo;
}

// Generate a cache for a Falcor Model from sample data files
gulp.task('sample-data', function(cb) {
  // Start by creating indexes by Id
  var jsonGraph = {
    usersById: _.indexBy(users, 'userId'), 
    videosById: _.indexBy(videos, 'videoId')
  };
  
  // Add some related data to the videos by Id map
  _.forEach(jsonGraph.videosById, function(video) {
    var videoId = video.videoId;
    
    // Tags have to wrapped in an atom since they're meant to be retrieved all together
    video.tags = $atom(video.tags);
    
    // Give each video a number of views
    video.views = generateViews(videoId);
    
    // Give a reference to an author in usersById
    video.author = generateAuthorRef(videoId);
    
    // Generate a rating for the video
    video.rating = generateRating(videoId);
    
    // Generate comments for each video
    video.comments = generateComments(videoId, video.addedDate);
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