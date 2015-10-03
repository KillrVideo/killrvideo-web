var gulp = require('gulp');
var concat = require('gulp-concat');
var livereload = require('gulp-livereload');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var watch = require('gulp-watch');
var del = require('del');
var path = require('path');

var cfg = require('./build-config');

// Some constants
var FILES = [
  './node_modules/bootswatch/cosmo/bootstrap.css',
  './node_modules/font-awesome/css/font-awesome.css',
  './src/css/app.css'
];
var FILE_NAME = 'killrvideo.css';
var MINIFIED_FILE_NAME = 'killrvideo.min.css';
var BUILD_OUTPUT = path.join(cfg.BUILD_OUTPUT, 'css');

// Clean the CSS output folder
gulp.task('clean.css', function() {
  return del(BUILD_OUTPUT);
});

// Concat any css and put in output directory
gulp.task('css', [ 'clean.css' ], function() {
  return gulp.src(FILES)
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