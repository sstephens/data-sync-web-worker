

const gulp = require("gulp");
const browserify = require('browserify');
const source = require('vinyl-source-stream');

gulp.task("build", function () {
  return browserify({ entries: './src/index.js' })
		.transform('babelify', { presets: ['env'] })
		.bundle()
		.pipe(source('index.js'))
		.pipe(gulp.dest("dist"));
});

gulp.task('watch', ['build'], function() {
	gulp.watch('./src/**/*.js', ['build']);
});

gulp.task('default', ['build']);
