var gulp = require('gulp');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var autoPrefixer = require('gulp-autoprefixer');
//if node version is lower than v.0.1.2
require('es6-promise').polyfill();
var cssComb = require('gulp-csscomb');
var cmq = require('gulp-merge-media-queries');
var cleanCss = require('gulp-clean-css');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var pug = require('gulp-pug');
var minifyHtml = require('gulp-minify-html');
var imageMin = require('gulp-imagemin');
var cache = require('gulp-cache');
var fs = require('fs');
var path = require('path');
var merge = require('merge-stream');

var scriptsPath = 'src/js';

function getFolders(dir) {
    return fs.readdirSync(dir)
    .filter(function(file) {
        return fs.statSync(path.join(dir, file)).isDirectory();
    });
}

gulp.task('scss',function(){
    gulp.src(['src/scss/**/*.scss'])
    .pipe(plumber({
        handleError: function (err) {
            console.log(err);
            this.emit('end');
        }
    }))
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(autoPrefixer())
    .pipe(cssComb())
    .pipe(cmq({log:true}))
    .pipe(concat('styles.css'))
    .pipe(gulp.dest('dist/css'))
    .pipe(rename({
        suffix: '.min'
    }))
    .pipe(cleanCss())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/css'))
});

gulp.task('js', function() {
 var folders = getFolders(scriptsPath);

 var tasks = folders.map(function(folder) {
  return gulp.src(path.join(scriptsPath, folder, '/**/*.js'))
        // concat into foldername.js
        .pipe(concat(folder + '.js'))
        // write to output
        .pipe(gulp.dest('dist/js'))
    });

   // process all remaining files in scriptsPath root into main.js and main.min.js files
   var root = gulp.src(path.join(scriptsPath, '/*.js'))
   .pipe(concat('main.js'))
   .pipe(gulp.dest('dist/js'))

   return merge(tasks, root);
});

gulp.task('pug',function(){
    gulp.src(['src/html/**/*.pug'])
    .pipe(plumber({
        handleError: function (err) {
            console.log(err);
            this.emit('end');
        }
    }))
    .pipe(pug())
    .pipe(minifyHtml())
    .pipe(gulp.dest('dist'))
});
gulp.task('image',function(){
    gulp.src(['src/images/**/*'])
    .pipe(plumber({
        handleError: function (err) {
            console.log(err);
            this.emit('end');
        }
    }))
    .pipe(cache(imageMin()))
    .pipe(gulp.dest('dist/images'))
});
gulp.task('default',function(){
    gulp.watch('src/js/**/*.js',['js']);
    gulp.watch('src/scss/**/*.scss',['scss']);
    gulp.watch('src/html/**/*.pug',['pug']);
    gulp.watch('src/images/**/*',['image']);
});
