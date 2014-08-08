'use strict';

/**
 * Import plugins
 */
var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    browserSync = require('browser-sync'),
    reload = browserSync.reload,
    runSequence = require('run-sequence'),
    del = require('del');

/**
 * Build vendors dependencies
 */
gulp.task('vendors', function() {

  gulp.src([
      'bower_components/angular/angular.js',
      'bower_components/polymer/polymer.js'
    ])
    .pipe($.concat('vendors.min.js'))
    .pipe($.uglify())
    .pipe(gulp.dest('build/js'));

});

/**
 * Build styles from SCSS files
 * With error reporting on compiling (so that there's no crash)
 */
gulp.task('styles', function() {
  return gulp.src('assets/sass/musashi.scss')
    .pipe($.sass())
      .on('error', $.util.beep)
      .on('error', $.notify.onError(function (error) {
        return 'Message to the notifier: ' + error.message;
      }))
    .pipe($.autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1'))
    .pipe($.minifyCss())
    .pipe(gulp.dest('build/css'));
});

/**
 * Build JS
 * With error reporting on compiling (so that there's no crash)
 */
gulp.task('scripts', function() {
  return gulp.src('assets/js/*.js')
    .pipe($.concat('musashi.js'))
    .pipe(gulp.dest('build/js'))
    .pipe($.rename({ suffix: '.min' }))
    .pipe($.uglify())
    .pipe(gulp.dest('build/js'));
});

/**
 * Lint JS
 */

 gulp.task('jshint', function () {
   return gulp.src('assets/js/*js')
     .pipe($.jshint())
     .pipe($.jshint.reporter('jshint-stylish'))
     .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
 });

/**
 * Build Hologram Styleguide
 */
gulp.task('styleguide', function () {
  return gulp.src('hologram_config.yml')
    .pipe($.hologram());
});

/**
 * Clean output directories
 */
gulp.task('clean', del.bind(null, ['build', 'styleguide']));

/**
 * Serve
 */
gulp.task('serve', ['styles'], function () {
  browserSync({
    server: {
      baseDir: ['styleguide'],
    },
    open: false
  });
  gulp.watch(['**/*.html'], reload);
  gulp.watch(['assets/sass/**/*.scss'], function() {
    runSequence('styles', 'styleguide', reload);
  });
});

/**
 * Deploy to GH pages
 */

gulp.task('deploy', function () {
  gulp.src("styleguide/**/*")
    .pipe($.ghPages());
});

/**
 * Default task
 */
gulp.task('default', ['clean'], function(cb) {
  runSequence('vendors', 'styles', 'jshint', 'scripts', 'styleguide', cb);
});

