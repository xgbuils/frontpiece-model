var gulp  = require('gulp')
var mocha = require('gulp-mocha')

gulp.task('test', function () {
  gulp.src('./test/test.js')
    .pipe(mocha())
})

gulp.task('test:backbone', function () {
  gulp.src('./test/backbone-model-test.js')
    .pipe(mocha())
})