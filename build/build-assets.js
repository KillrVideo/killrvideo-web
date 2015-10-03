var gulp = require('gulp');
var newer = require('gulp-newer');
var watch = require('gulp-watch');
var livereload = require('gulp-livereload');
var del = require('del');
var merge = require('merge-stream');
var path = require('path');

var cfg = require('./build-config');

// Some constants
var IMAGE_OUTPUT = path.join(cfg.BUILD_OUTPUT, 'images');
var IMAGE_FILES = [
  './images/**/*'
];
var FONT_OUTPUT = path.join(cfg.BUILD_OUTPUT, 'fonts');
var FONT_FILES = [
  './node_modules/font-awesome/fonts/*'
];

// Clean images and fonts output folders
gulp.task('clean.assets', function() {
  return del([ IMAGE_OUTPUT, FONT_OUTPUT ]);
});

// Copy images and fonts to output folders
gulp.task('assets', [ 'clean.assets' ], function() {
  var images = gulp.src(IMAGE_FILES)
    .pipe(gulp.dest(IMAGE_OUTPUT));
  
  var fonts = gulp.src(FONT_FILES)
    .pipe(gulp.dest(FONT_OUTPUT));
    
  return merge(images, fonts);
});

// Watch for new image files and add them to the build output
gulp.task('watch.assets', function(cb) {
  watch(IMAGE_FILES, function() { gulp.start('images.sync'); })
    .on('end', function() { cb(); });
});

// Sync new images to build output directory
gulp.task('images.sync', function() {
  return gulp.src(IMAGE_FILES)
    .pipe(newer(IMAGE_OUTPUT))
    .pipe(gulp.dest(IMAGE_OUTPUT))
    .pipe(livereload());
});