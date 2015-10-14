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
  'babel-core/polyfill', 'history', 'lodash', 'react', 'react-bootstrap', 'react-redux',
  'react-router', 'redux', 'redux-actions', 'redux-devtools', 'redux-form', 'redux-logger', 'redux-router',
  'redux-thunk', 'validate.js',
  
  // Node libs that are shimmed by browserify
  'url'
];
var VENDOR_FILE_NAME = 'vendor.js';
var VENDOR_MINIFIED_FILE_NAME = 'vendor.min.js';

var BUILD_OUTPUT = path.join(cfg.BUILD_OUTPUT, 'js');

// Clean the JS output folder
gulp.task('clean.js', function() {
  return del(BUILD_OUTPUT);
});

// Build for local development
gulp.task('js.debug', [ 'clean.js' ], function() {
  return build({
    debug: true,
    cache: {},
    packageCache: {}
  });
});

// Build for release and compress/uglify JavaScript
gulp.task('js.release', [ 'clean.js' ], function() {
  return build({ debug: false });
});

// Build vendor bundle
gulp.task('js.vendor', [ 'clean.js' ], function() {
  var b = browserify({ debug: false });
  VENDOR_LIBS.forEach(function(lib) {
    b.require(nodeResolve.sync(lib), { expose: lib });
  });
  
  return b.bundle()
    .on('error', function(err) {
      gutil.log(gutil.colors.red('Browserify error:'), err.message);
      this.emit('end');
    })
    .pipe(source(VENDOR_FILE_NAME))
    .pipe(gulp.dest(BUILD_OUTPUT));
});

// Uglify Javascript and output
gulp.task('uglify', [ 'js.release', 'js.vendor' ], function() {
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

// Builds JS and if debug is enabled, does incremental builds on updates to JSX
function build(opts) {
  // Setup browserify and have it transpile JSX with reactify
  var browserifyOpts = _.assign({
    extensions: [ '.jsx' ],
    entries: [ ENTRY_POINT ],
    paths: [ './src/js' ]
  }, opts);
  
  // Create the appropriate browserify object (use watchify for dev to allow incremental builds)
  var b = browserify(browserifyOpts);
  
  // Tell browserify about external vendor dependencies
  VENDOR_LIBS.forEach(function(lib) { b.external(lib); });
  
  if (opts.debug) {
    b = watchify(b);
    b.on('update', function(ids) {
        ids.forEach(function(id) {
          gutil.log('Changes detected to', gutil.colors.magenta(id))
        })
        gutil.log('Rebundling...');
      })
      .on('update', bundle)
      .on('log', function(msg) { gutil.log(msg); });
  }
  
  function bundle() {
    return b.transform(babelify)
      .bundle()
      .on('error', function(err) {
        gutil.log(gutil.colors.red('Browserify error:'), err.message);
        this.emit('end');
      })
      .pipe(source(FILE_NAME))
      .pipe(gulp.dest(BUILD_OUTPUT))
      .pipe(livereload());
  }
  
  // Create the bundle initially (if dev, watchify will take care of building after changes)
  return bundle();
}