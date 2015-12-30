var gulp = require('gulp');
var streamify = require('gulp-streamify');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var livereload = require('gulp-livereload');
var gutil = require('gulp-util');
var browserify = require('browserify');
var babelify = require('babelify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var del = require('del');
var path = require('path');
var _ = require('lodash');
var nodeResolve = require('resolve');
var merge = require('merge-stream');

var cfg = require('./build-config');

// Some constants
var ENTRY_POINT = './src/js/index.jsx';
var FILE_NAME = 'killrvideo.js';
var MINIFIED_FILE_NAME = 'killrvideo.min.js';

var VENDOR_LIBS = [
  // Third party libs
  'bluebird', 'classnames', 'falcor', 'falcor-http-datasource', 'get-size', 'history', 'load-script', 'lodash', 
  'md5', 'moment', 'react', 'react-bootstrap', 'react-dom', 'react-dropzone', 'react-redux', 'react-router', 
  'react-gemini-scrollbar', 'redux', 'redux-actions', 'redux-form', 'redux-logger', 'redux-promise-middleware', 
  'redux-router', 'redux-thunk', 'validate.js', 'video.js',
  
  // Node libs that are shimmed by browserify
  'url', 'querystring'
];
var VENDOR_FILE_NAME = 'vendor.js';
var VENDOR_MINIFIED_FILE_NAME = 'vendor.min.js';

var BUILD_OUTPUT = path.join(cfg.BUILD_OUTPUT, 'dist', 'js');

// Clean the JS output folder
gulp.task('clean.js', function() {
  return del(BUILD_OUTPUT);
});

// Build JavaScript
gulp.task('js', function() {
  var browserifyOpts = _.assign({
    extensions: [ '.jsx' ],
    entries: [ ENTRY_POINT ],
    paths: [ './src/js' ]
  }, cfg.BROWSERIFY_OPTS);
  
  // Create the browserify object for bundling and tell it about external vendor dependencies
  // which are bundled separately
  var app = browserify(browserifyOpts);
  VENDOR_LIBS.forEach(function(lib) { app.external(lib); });
  
  // Use watchify to rebuild app on changes if we're watching JS files
  if (cfg.WATCH) {
    app = watchify(app);
    app.on('update', function(ids) {
        ids.forEach(function(id) {
          gutil.log('Changes detected to', gutil.colors.magenta(id))
        })
        gutil.log('Rebundling...');
      })
      .on('update', bundleApp)
      .on('log', function(msg) { gutil.log(msg); });
  }
  
  function bundleApp() {
    return app.transform(babelify)
      .bundle()
      .on('error', function(err) {
        gutil.log(gutil.colors.red('Browserify error:'), err.message);
        this.emit('end');
      })
      .pipe(source(FILE_NAME))
      .pipe(gulp.dest(BUILD_OUTPUT))
      .pipe(livereload());
  }
  
  // Start initial app bundling
  var appBundle = bundleApp();
  
  // Create vendor bundle
  var vendor = browserify(cfg.BROWSERIFY_OPTS);
  VENDOR_LIBS.forEach(function(lib) {
    vendor.require(nodeResolve.sync(lib), { expose: lib });
  });
 
  // Start vendor bundling (no watching for changes here)
  var vendorBundle = vendor.bundle()
    .on('error', function(err) {
      gutil.log(gutil.colors.red('Browserify error:'), err.message);
      this.emit('end');
    })
    .pipe(source(VENDOR_FILE_NAME))
    .pipe(gulp.dest(BUILD_OUTPUT));
  
  return merge(appBundle, vendorBundle);
});

// Uglify Javascript and output minified files
gulp.task('uglify', function() {
  var jsOutput = path.join(BUILD_OUTPUT, FILE_NAME);
  var uglifyApp = gulp.src(jsOutput)
    .pipe(streamify(uglify()))
    .pipe(rename(MINIFIED_FILE_NAME))
    .pipe(gulp.dest(BUILD_OUTPUT));
  
  var vendorOutput = path.join(BUILD_OUTPUT, VENDOR_FILE_NAME);
  var uglifyVendor = gulp.src(vendorOutput)
    .pipe(streamify(uglify()))
    .pipe(rename(VENDOR_MINIFIED_FILE_NAME))
    .pipe(gulp.dest(BUILD_OUTPUT));
    
  return merge(uglifyApp, uglifyVendor);
});