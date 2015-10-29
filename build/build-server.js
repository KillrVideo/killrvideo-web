var gulp = require('gulp');
var path = require('path');
var del = require('del');
var babel = require('gulp-babel');
var watch = require('gulp-watch');
var livereload = require('gulp-livereload');
var gulpif = require('gulp-if');
var cache = require('gulp-cached');
var nodemon = require('nodemon');
var merge = require('merge-stream');

var cfg = require('./build-config');

// Some constants
var BUILD_OUTPUT = path.join(cfg.BUILD_OUTPUT, 'server');
var FILES = './dev/**/*.js';
var HTML_FILE = './dev/server.html';

// Clean the server output directory
gulp.task('clean.server', function() {
  return del(BUILD_OUTPUT);
});

// Build the server files
gulp.task('server', function() {
  // Compile JS with Babel
  var serverJs = gulp.src(FILES)
    .pipe(gulpif(cfg.WATCH, cache('server')))
    .pipe(babel())
    .pipe(gulp.dest(BUILD_OUTPUT));
  
  // Copy HTML to output
  var serverHtml = gulp.src(HTML_FILE)
    .pipe(gulpif(cfg.WATCH, cache('serverhtml')))
    .pipe(gulp.dest(BUILD_OUTPUT));
    
  return merge(serverJs, serverHtml);
});

// Watch server files for changes and rebuild
gulp.task('watch.server', function() {
  var jsWatch = watch(FILES, function(file) {
    if (file.event === 'unlink') {
      delete cache.caches['server'][file.path];
    }
    gulp.start('server');
  });
  var htmlWatch = watch(HTML_FILE, function() {
    gulp.start('server');
  });
  
  return merge(jsWatch, htmlWatch);
});

// Start a development server
gulp.task('start-server', function(cb) {
  // Use nodemon to start the development server and watch for changes
  nodemon({
    script: path.join(BUILD_OUTPUT, 'server.js'),
    watch: BUILD_OUTPUT
  });
  
  // Enable live reload for when client files change
  livereload.listen();
  
  var firstStart = true;
  nodemon.on('start', function() {
    if (firstStart) {
      firstStart = false;
      cb();
    }
  }).on('restart', function() {
    console.log('Restarting development server...');
    livereload.reload();
  });
});
