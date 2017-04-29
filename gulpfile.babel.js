import process from 'process';
import path from 'path';

import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import util from 'gulp-util';
import plumber from 'gulp-plumber';
import mocha from 'gulp-mocha';
import winston from 'winston';

const plugins = gulpLoadPlugins();

const paths = {
  integrationTests: ['src/integration/**/*.js']
};

// Lint Javascript
gulp.task('lint', () =>
  gulp.src(paths.integrationTests)
    // eslint() attaches the lint output to the "eslint" property
    // of the file object so it can be used by other modules.
    .pipe(plugins.eslint())
    // eslint.format() outputs the lint results to the console.
    // Alternatively use eslint.formatEach() (see Docs).
    .pipe(plugins.eslint.format())
    // To have the process exit with an error code (1) on
    // lint error, return the stream and pipe to failAfterError last.
    .pipe(plugins.eslint.failAfterError())
);

// Compile ES6 to ES5 and copy to dist
gulp.task('babel', () =>
  gulp.src([...paths.integrationTests, '!gulpfile.babel.js'], { base: paths.cwd })
    .pipe(plugins.newer('dist'))
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.babel())
    .pipe(plugins.sourcemaps.write('.', {
      includeContent: false,
      sourceRoot(file) {
        return path.relative(file.path, __dirname);
      }
    }))
    .pipe(gulp.dest('dist'))
);

gulp.task('serve', function() {
  util.log(`Running integration tests against the following base URL: ${process.env.GM_API_BASE_URL}`)
  return preprocessForTesting(paths.integrationTests);
});

function preprocessForTesting(testFiles) {
  if (process.env.NODE_ENV !== 'prod') {
    return runTest(testFiles);
  } else {
    util.log('You can run tests only in non prod envs');
  }
}

function runTest(testFiles) {
  let reporters;
  return gulp.src(testFiles)
    .pipe(plumber())
    .pipe(mocha({
      reporter: process.env.GM_MOCHA_REPORTER || 'spec',
    }))
    .once('error', (err) => {
      util.log(err);
      process.exit(1);
    })
    .once('error', (err) => {
      util.log(err);
      process.exit(1);
    })
    .once('end', () => {
      util.log('completed !!');
      process.exit(0);
    });
}

// default task: clean dist, compile js files and copy non-js files.
gulp.task('default', ['babel'], () => {});