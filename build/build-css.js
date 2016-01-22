var gulp = require('gulp');
var concat = require('gulp-concat');
var livereload = require('gulp-livereload');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var watch = require('gulp-watch');
var replace = require('gulp-replace');
var gulpif = require('gulp-if');
var remember = require('gulp-remember');
var cache = require('gulp-cached');
var del = require('del');
var path = require('path');

var cfg = require('./build-config');

// Some constants
var FILES = [
  './node_modules/bootswatch/cosmo/bootstrap.css',
  './node_modules/font-awesome/css/font-awesome.css',
  './node_modules/gemini-scrollbar/gemini-scrollbar.css',
  './src/css/*'
];
var FILE_NAME = 'killrvideo.css';
var MINIFIED_FILE_NAME = 'killrvideo.min.css';
var BUILD_OUTPUT = path.join(cfg.BUILD_OUTPUT, 'dist', 'css');

// Clean the CSS output folder
gulp.task('clean.css', function() {
  return del(BUILD_OUTPUT);
});

// Concat any css and put in output directory
gulp.task('css', function() {
  return gulp.src(FILES)
    .pipe(gulpif(cfg.WATCH, cache('cssfiles')))
    .pipe(gulpif(cfg.WATCH, remember('cssfiles')))   // Remember all files so on changes everything gets concated
    .pipe(concat(FILE_NAME))
    .pipe(gulp.dest(BUILD_OUTPUT))
    .pipe(livereload());
});

// Watch CSS for changes and rebuild
gulp.task('watch.css', function() {
  return watch(FILES, function(file) {
    // If file is deleted, stop caching/remembering it
    if (file.event === 'unlink') {
      delete cache.caches['cssfiles'][file.path];
      remember.forget('cssfiles', file.path);
    }
    gulp.start('css'); 
  });
});

// Minify CSS
gulp.task('minify', function() {
  var cssOutput = path.join(BUILD_OUTPUT, FILE_NAME);
  return gulp.src(cssOutput)
    .pipe(minifyCss())
    .pipe(rename(MINIFIED_FILE_NAME))
    .pipe(gulp.dest(BUILD_OUTPUT));
});