var gulp = require('gulp');
var del = require('del');
var nodemon = require('nodemon');
var livereload = require('gulp-livereload');
var watch = require('gulp-watch');

// Load gulp tasks in other files
require('./build/build-assets');
require('./build/build-css');
require('./build/build-js');

var cfg = require('./build/build-config');

// Some constants
var RELEASE_OUTPUT = './dist';

// Clean the release output folder
gulp.task('clean.release', function() {
  return del(RELEASE_OUTPUT);
});

// Build aliases for debug/release builds
gulp.task('build.debug', [ 'js.debug', 'js.vendor', 'css', 'assets' ]);
gulp.task('build.release', [ 'js.release', 'js.vendor', 'uglify', 'css', 'minify', 'assets' ]);

// Start a development server
gulp.task('server', [ 'build.debug' ], function(cb) {
  nodemon({
    script: 'server.js',
    ignore: [ 'src/**/*', 'build/**/*', cfg.BUILD_OUTPUT, RELEASE_OUTPUT, 'gulpfile.js' ]
  });
  
  var firstStart = true;
  nodemon.on('start', function() {
    if (firstStart) {
      firstStart = false;
      cb();
    }
  }).on('restart', function() {
    console.log('Restarting development server...');
  });
});

// Watch for the server
gulp.task('watch.server', function(cb) {
  // Enable live reload
  livereload.listen();
  
  // Watch for changes to html file and reload
  watch('server.html', function() { livereload.reload(); })
    .on('end', function() { cb(); });
});

// Watch for changes
gulp.task('watch', [ 'watch.css', 'watch.assets', 'watch.server' ]);

// Build for release and copy to distribution folder
gulp.task('release', [ 'clean.release', 'build.release' ], function() {
  return gulp.src(cfg.BUILD_OUTPUT + '/**/*')
    .pipe(gulp.dest(RELEASE_OUTPUT));
});

// Default task is for development
gulp.task('default', [ 'build.debug', 'server', 'watch' ]);