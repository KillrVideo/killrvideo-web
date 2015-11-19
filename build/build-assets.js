var gulp = require('gulp');
var watch = require('gulp-watch');
var livereload = require('gulp-livereload');
var del = require('del');
var merge = require('merge-stream');
var path = require('path');

var cfg = require('./build-config');

// Some constants
var IMAGE_OUTPUT = path.join(cfg.BUILD_OUTPUT, 'dist', 'images');
var IMAGE_FILES = [
  './images/**/*'
];
var FONT_OUTPUT = path.join(cfg.BUILD_OUTPUT, 'dist', 'fonts');
var FONT_FILES = [
  './node_modules/bootstrap/dist/fonts/*',
  './node_modules/font-awesome/fonts/*',
  './node_modules/video.js/dist/font/*'
];

// Clean images and fonts output folders
gulp.task('clean.assets', function() {
  return del([ IMAGE_OUTPUT, FONT_OUTPUT ]);
});

// Copy images and fonts to output folders
gulp.task('assets', function() {
  var images = gulp.src(IMAGE_FILES)
    .pipe(gulp.dest(IMAGE_OUTPUT))
    
  
  var fonts = gulp.src(FONT_FILES)
    .pipe(gulp.dest(FONT_OUTPUT));
  
  return merge(images, fonts);
});

// Copy added/changed images to output
gulp.task('watch.assets', function() {
  return watch(IMAGE_FILES, { events: [ 'add', 'change' ] })
    .pipe(gulp.dest(IMAGE_OUTPUT))
    .pipe(livereload());
});