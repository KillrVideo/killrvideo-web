var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var browserify = require('browserify');
var watchify = require('watchify');
var reactify = require('reactify');
var source = require('vinyl-source-stream');
var merge = require('merge-stream');
var del = require('del');
var nodemon = require('nodemon');
var _ = require('lodash');
var path = require('path');

// Load any gulp plugins from package.json
var plugins = gulpLoadPlugins();

var paths = {
  BUILD_OUTPUT: 'build',
  RELEASE_OUTPUT: 'dist',
  
  JS_ENTRY_POINT: './src/js/app.jsx',
  JS_BUILD_OUTPUT: 'build/js',
  JS_OUTPUT_NAME: 'killrvideo.js',
  JS_MINIFIED_NAME: 'killrvideo.min.js',
  
  CSS_FILES: [ 
    './src/css/app.css' 
  ],
  CSS_BUILD_OUTPUT: 'build/css',
  CSS_OUTPUT_NAME: 'killrvideo.css',
  CSS_MINIFIED_NAME: 'killrvideo.min.css',
  
  IMAGE_FILES: [
    './images/**/*.*'
  ],
  IMAGE_OUTPUT: 'build/images'
};

// Clean tasks for deleting files
gulp.task('clean.js', function() {
  return del(paths.JS_BUILD_OUTPUT); 
});

gulp.task('clean.css', function() {
  return del(paths.CSS_BUILD_OUTPUT);
});

gulp.task('clean.images', function() {
  return del(paths.IMAGE_OUTPUT);
});

gulp.task('clean.release', function() {
  return del(paths.RELEASE_OUTPUT);
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
gulp.task('js.release', [ 'clean.js' ], function(cb) {
  return build({ debug: false })
    .pipe(plugins.streamify(plugins.uglify()))
    .pipe(plugins.rename(paths.JS_MINIFIED_NAME))
    .pipe(gulp.dest(paths.JS_BUILD_OUTPUT));
});

// Uglify Javascript and output
gulp.task('uglify', [ 'js.release' ], function() {
  var jsOutput = path.join(paths.JS_BUILD_OUTPUT, paths.JS_OUTPUT_NAME);
  return gulp.src(jsOutput)
    .pipe(plugins.streamify(plugins.uglify()))
    .pipe(plugins.rename(paths.JS_MINIFIED_NAME))
    .pipe(gulp.dest(paths.JS_BUILD_OUTPUT));
});

// Builds JS and if debug is enabled, does incremental builds on updates to JSX
function build(opts) {
  // Setup browserify and have it transpile JSX with reactify
  var browserifyOpts = _.assign({
    entries: [ paths.JS_ENTRY_POINT ],
    transform: [ reactify ]
  }, opts);
  
  // Create the appropriate browserify object (use watchify for dev to allow incremental builds)
  var b = browserify(browserifyOpts);
  if (opts.debug) {
    b = watchify(b);
    b.on('update', function() {
      // Create new bundle when there are changes
      b.bundle()
        .pipe(source(paths.JS_OUTPUT_NAME))
        .pipe(gulp.dest(paths.JS_BUILD_OUTPUT))
        .pipe(plugins.livereload());
    });
  }
  
  // Create the bundle initially (if dev, watchify will take care of building after changes)
  return b.bundle()
    .pipe(source(paths.JS_OUTPUT_NAME))
    .pipe(gulp.dest(paths.JS_BUILD_OUTPUT))
    .pipe(plugins.livereload());
}

// Concat any css and put in output directory
gulp.task('css', [ 'clean.css' ], function() {
  return gulp.src(paths.CSS_FILES)
    .pipe(plugins.concat(paths.CSS_OUTPUT_NAME))
    .pipe(gulp.dest(paths.CSS_BUILD_OUTPUT))
    .pipe(plugins.livereload());
});

// Minify CSS
gulp.task('minify', [ 'css' ], function() {
  var cssOutput = path.join(paths.CSS_BUILD_OUTPUT, paths.CSS_OUTPUT_NAME);
  return gulp.src(cssOutput)
    .pipe(plugins.minifyCss())
    .pipe(plugins.rename(paths.CSS_MINIFIED_NAME))
    .pipe(gulp.dest(paths.CSS_BUILD_OUTPUT));
});

// Copy images to the build output directory
gulp.task('images', [ 'clean.images' ], function() {
  return gulp.src(paths.IMAGE_FILES)
    .pipe(gulp.dest(paths.IMAGE_OUTPUT));
});

// Sync new images to build output directory
gulp.task('images.sync', function() {
  return gulp.src(paths.IMAGE_FILES)
    .pipe(plugins.newer(paths.IMAGE_OUTPUT))
    .pipe(gulp.dest(paths.IMAGE_OUTPUT))
    .pipe(plugins.livereload());
});

// Build aliases for debug/release builds
gulp.task('build.debug', [ 'js.debug', 'css', 'images' ]);
gulp.task('build.release', [ 'js.release', 'uglify', 'css', 'minify', 'images' ]);

// Start a development server
gulp.task('server', [ 'build.debug' ], function(cb) {
  nodemon({
    script: 'server.js',
    ignore: [ 'src/**/*', 'build/**/*', 'dist/**/*', 'gulpfile.js' ]
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

// Watch for changes and re-run tasks
gulp.task('watch', [ 'server' ], function() {
  // Enable live reload
  plugins.livereload.listen();
  
  // Watch for changes to CSS source files and rebuild
  plugins.watch(paths.CSS_FILES, function() { gulp.start('css'); });
    
  // Watch for new images and add them
  plugins.watch(paths.IMAGE_FILES, function() { gulp.start('images.sync'); });
    
  // Watch for changes to html file and reload
  plugins.watch('server.html', function() { plugins.livereload.reload(); });
});

// Build for release and copy to distribution folder
gulp.task('release', [ 'clean.release', 'build.release' ], function() {
  return gulp.src(paths.BUILD_OUTPUT + '/**/*')
    .pipe(gulp.dest(paths.RELEASE_OUTPUT));
});

// Default task is for development
gulp.task('default', [ 'watch' ]);