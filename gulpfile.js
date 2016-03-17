/*jshint esversion: 6*/
const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const $ = gulpLoadPlugins();
const runSequence = require('run-sequence');
const browserSync = require('browser-sync').create();

gulp.task('clean', require('del').bind(null, ['dist']));

gulp.task('lint', () => {
  return gulp.src('js/*').pipe($.eslint({
    'parserOptions': {
        'ecmaVersion': 6
    },
    'rules':{
        'quotes': [1, 'single'],
        'semi': [1, 'always']
    }
  }))
  .pipe($.eslint.format())
  // Brick on failure to be super strict
  .pipe($.eslint.failOnError());
});

gulp.task('babel', () => {
	return gulp.src('js/*.js')
		.pipe($.babel({
			presets: ['es2015']
		}))
		.pipe(gulp.dest('dist'));
});

gulp.task('build', ['lint', 'babel'], () => {
  return gulp.src('dist').pipe($.size({title: 'build', gzip: false}));
});

gulp.task('watch', ['lint', 'babel'], () => {
  browserSync.init({
    files: ['js/*.js', '*.php'],
    proxy: 'http://localhost/ajaxloader/',
  });
  gulp.watch(['js/*.js', '*.php'], ['build']);
});

gulp.task('default', ['clean'], () => {
  gulp.start('build');
});
