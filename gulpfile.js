var gulp = require('gulp');
var del = require('del');
var runSequence = require('run-sequence');

// Load gulp tasks in other files
require('./build/build-assets');
require('./build/build-css');
require('./build/build-js');
require('./build/build-server');

var cfg = require('./build/build-config');

// Some constants
var RELEASE_OUTPUT = './dist';

// Alias for cleaning everything
gulp.task('clean', [ 'clean.js', 'clean.css', 'clean.assets' ]);

// Clean then build
gulp.task('build', function(cb) {
  runSequence(
    'clean',
     [ 'js', 'css', 'assets' ],
     cb
  );
});

// Watch and rebuild
gulp.task('watch', [ 'watch.css', 'watch.assets', 'watch.server' ]);

// Clean the release output folder
gulp.task('clean.release', function(cb) {
  return del(RELEASE_OUTPUT, cb);
});

// Build for release and copy to distribution folder
gulp.task('release', [ 'clean.release', 'build', 'uglify', 'minify' ], function() {
  return gulp.src(cfg.BUILD_OUTPUT + '/dist/**/*')
    .pipe(gulp.dest(RELEASE_OUTPUT));
});

// Default task is for development
gulp.task('default', function(cb) {
  // Set configuration for development builds
  cfg.WATCH = true;
  cfg.BROWSERIFY_OPTS = {
    debug: true,
    cache: {},
    packageCache: {}
  };
  
  // Run build and start development express server
  runSequence(
    [ 'build', 'clean.server' ],
    'server',
    ['start-server', 'watch'],
    cb
  );
});