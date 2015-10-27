var gulp = require('gulp');
var concat = require('gulp-concat');
var livereload = require('gulp-livereload');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var watch = require('gulp-watch');
var replace = require('gulp-replace');
var gulpif = require('gulp-if');
var del = require('del');
var path = require('path');

var cfg = require('./build-config');

// Some constants
var FILES = [
  './node_modules/bootswatch/cosmo/bootstrap.css',
  './node_modules/font-awesome/css/font-awesome.css',
  './node_modules/video.js/dist/video-js.css',
  './node_modules/react-gemini-scrollbar/node_modules/gemini-scrollbar/gemini-scrollbar.css',
  './src/css/*'
];
var FILE_NAME = 'killrvideo.css';
var MINIFIED_FILE_NAME = 'killrvideo.min.css';
var BUILD_OUTPUT = path.join(cfg.BUILD_OUTPUT, 'css');

function isVideoJs(file) {
  return file.relative === 'video-js.css';
}

// Clean the CSS output folder
gulp.task('clean.css', function() {
  return del(BUILD_OUTPUT);
});

// Concat any css and put in output directory
gulp.task('css', [ 'clean.css' ], function() {
  return gulp.src(FILES)
    .pipe(gulpif(isVideoJs, replace('url(\'font/', 'url(\'fonts/')))  // Replace "font/" path with "fonts/" (for video.js CSS)
    .pipe(concat(FILE_NAME))
    .pipe(gulp.dest(BUILD_OUTPUT))
    .pipe(livereload());
});

// Minify CSS
gulp.task('minify', [ 'css' ], function() {
  var cssOutput = path.join(BUILD_OUTPUT, FILE_NAME);
  return gulp.src(cssOutput)
    .pipe(minifyCss())
    .pipe(rename(MINIFIED_FILE_NAME))
    .pipe(gulp.dest(BUILD_OUTPUT));
});

// Watch for CSS source file changes and rebuild
gulp.task('watch.css', function(cb) {
  watch(FILES, function() { gulp.start('css'); })
    .on('end', function() { cb(); });
});