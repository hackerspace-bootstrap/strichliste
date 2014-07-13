var gulp = require('gulp');
var clean = require('gulp-clean');
var browserify = require('gulp-browserify');
var concat = require('gulp-concat');
var merge = require('merge-stream');
var order = require('gulp-order');
var less = require('gulp-less');
var sequence = require('run-sequence');

var SOURCE_DIR = 'frontendSource';
var TARGET_DIR = 'frontend';

gulp.task('clean', function (callback) {
    return gulp.src(TARGET_DIR).pipe(clean());
});

gulp.task('style', function () {
    var lessStream = gulp.src(SOURCE_DIR + '/style/*.less')
        .pipe(less());

    var libsStream = gulp.src(SOURCE_DIR + '/style/libs/*.css')
        .pipe(order([
            'normalize-*',
            'bootstrap.css',
            'bootstrap-responseive.css'
        ]))
        .pipe(concat('bert.css'));

    //I'm quite sure there's a better solution than this, but for now this will do
    return merge(libsStream, lessStream)
        .pipe(concat('style.css'))
        .pipe(gulp.dest(TARGET_DIR));
});

gulp.task('images', function () {
    return gulp.src(SOURCE_DIR + '/img/*').pipe(gulp.dest(TARGET_DIR + '/img'));
});

gulp.task('html', function () {
    return gulp.src(SOURCE_DIR + '/**/*.html').pipe(gulp.dest(TARGET_DIR));
});

gulp.task('scripts', function () {
    var browserifyStream = gulp.src(SOURCE_DIR + '/script/app.js')
        .pipe(browserify());

    //I'm quite sure there's a better solution than this, but for now this will do
    var libsStream = gulp.src(SOURCE_DIR + '/script/libs/*')
        .pipe(order([
            'jquery-*.js',
            'angular.js',
            'angular-translate.js',
            'bootstrap.js'
        ]))
        .pipe(concat('bert.js'));

    return merge(libsStream, browserifyStream)
        .pipe(concat('script.js'))
        //add uglify
        .pipe(gulp.dest(TARGET_DIR));
});

gulp.task('build', function(callback) {
    sequence('clean', ['html', 'images', 'style', 'scripts'], callback);
});

gulp.task('dev', function(callback) {
    //currently the whole buildprocess runs when something changes, in the future we can do this a little bit more granular, e.g. only rebuilding scripts, css, etc....
    sequence('clean', ['html', 'images', 'style', 'scripts'], function() {
        gulp.watch(SOURCE_DIR + '/**/*', ['html', 'images', 'style', 'scripts']);
        callback();
    });
});
