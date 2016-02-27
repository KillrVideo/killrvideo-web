var path = require('path');
var gulp = require('gulp');
var del = require('del');
var webpack = require('webpack');
var gutil = require('gulp-util');
var babel = require('gulp-babel');
var watch = require('gulp-watch');
var livereload = require('gulp-livereload');
var cache = require('gulp-cached');
var plumber = require('gulp-plumber');
var nodemon = require('nodemon');

// The config for our webpack build
var webpackConfig = require('./webpack.config.js');

// Some constants
var RELEASE_OUTPUT = './dist';

var SERVER_OUTPUT = './out/server';
var SERVER_FILES = './dev/**/*.js';
var HTML_FILE = './dev/server.html';


// Helper function for throwing errors and logging results of webpack builds
function handleWebpackBuild(err, stats) {
  if (err) throw new gutil.PluginError('webpack', err);
    
  gutil.log('[webpack]', stats.toString({
    chunkModules: false,
    children: false,
    colors: true 
  }));
}

// Clean the build output folder
gulp.task('clean', function() {
  return del(webpackConfig.output.path);
});

// Build the app
gulp.task('build', [ 'clean' ], function(cb) {
  webpack(webpackConfig, function(err, stats) {
    handleWebpackBuild(err, stats);
    cb();
  });
});

// Build the app and watch for changes
gulp.task('watch', [ 'clean' ], function(cb) {
  var compiler = webpack(webpackConfig);
  compiler.watch({}, function(err, stats) {
    handleWebpackBuild(err, stats);
    livereload.reload();    // TODO: Can we make this smarter based on stats and what changed?
  });
});

gulp.task('server.build', function() {
  return gulp.src(SERVER_FILES)
    .pipe(cache('server'))
    .pipe(plumber())    // Don't break pipe if babel has compiler errors
    .pipe(babel())
    .pipe(gulp.dest(SERVER_OUTPUT));
});

gulp.task('server.html', function() {
  return gulp.src(HTML_FILE)
    .pipe(cache('serverhtml'))
    .pipe(gulp.dest(SERVER_OUTPUT));
});

gulp.task('server.watch', [ 'server.build', 'server.html' ], function() {
  watch(SERVER_FILES, function(file) {
    if (file.event === 'unlink') {
      delete cache.caches['server'][file.path];
    }
    gulp.start('server.build');
  });
  
  watch(HTML_FILE, function() {
    gulp.start('server.html');
  });
});

// Build and start the development server
gulp.task('server', ['server.watch'], function(cb) {
  // Enable live reload for when client files change
  livereload.listen();
  
  // Use nodemon to start the development server and watch for changes
  nodemon({
    script: path.join(SERVER_OUTPUT, 'server.js'),
    watch: SERVER_OUTPUT,
    ext: 'js html',
    stdout: false
  }).on('restart', function() {
    gutil.log('[server]', 'Restarting development server...');
  }).on('readable', function() {
    this.stdout.on('data', function(chunk) {
      if (/^Listening/.test(chunk)) {
        livereload.reload();
      }
      process.stdout.write(chunk);
    });
    this.stderr.pipe(process.stderr);
  });
});

// Clean the release directory
gulp.task('release.clean', function() {
  return del(RELEASE_OUTPUT);
});

// Copy build output to distribution folder for a release
gulp.task('release', [ 'release.clean', 'build' ], function() {
  return gulp.src(webpackConfig.output.path + '/**/*')
    .pipe(gulp.dest(RELEASE_OUTPUT));
});

// Default task for development (build and watch app, build and start dev server)
gulp.task('default', [ 'watch', 'server' ]);