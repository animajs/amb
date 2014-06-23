var path = require('path');
var chalk = require('chalk');
var join = path.join;
var log = require('../lib/log');
var util = require('../lib/util');
var spm = require('spm');
var file = spm.sdk.file;
var _ = require('lodash');
var pipe = require('multipipe');

var umi = require('umi');
var Package = umi.Package;
var plugin = umi.plugin;
var standalonify = umi.standalonify;

var gi = require('gulp-if');
var less = require('gulp-less');
var cssmin = require('gulp-cssmin');
var uglify = require('gulp-uglify');
var flatten = require('gulp-flatten');
var peaches = require('gulp-peaches');
var html = require('./html');
var css = require('./css');

var gulp;

module.exports = function(opt, _gulp, cb) {
  gulp = _gulp;

  opt = umi.buildArgs(opt);
  opt = umi.util.extendOption(opt);

  // add package info
  try {
    var pkg = new Package(opt.cwd, {
      extraDeps: {handlebars: 'handlebars-runtime'}
    });
    log.info('package', 'dependencies: ' + Object.keys(pkg.dependencies));
    log.info('package', 'files: ' + Object.keys(pkg.files));
    opt.pkg = pkg;
  } catch(err) {
    return cb(err);
  }

  // get build files
  var files = getFiles(pkg);
  log.info('output', 'files: ' + files);

  defineBuildTask(files, opt);
  defineImageTask(opt);
  defineInstallTask(opt);

  gulp
    .on('task_start', function(e) {showLog('start', e);})
    .on('task_stop', function(e) {showLog('end', e);})
    .on('task_err', function(e) {cb(e.err);})
    .on('err', function(e) {cb(e.err);});

  gulp.task('default', ['prepare', 'install', 'img', 'jscss', 'html']);
  gulp.start.apply(gulp, ['default', cb]);
};

function defineBuildTask(files, opt) {
  var htmlDeps = ['jscss'];
  var jscssDeps = [];

  files.forEach(function(file) {
    var name = 'build file ' + file;
    if (util.isHTML(file)) {
      gulp.task(name, ['jscss'], buildHTML(file, opt));
      htmlDeps.push(name);
    } else if (util.isCSS(file)) {
      gulp.task(name, ['img', 'install'], buildCSS(file, opt));
      jscssDeps.push(name);
    } else if (util.isJS(file)) {
      gulp.task(name, ['img', 'install'], buildJS(file, opt));
      jscssDeps.push(name);
    }
  });

  gulp.task('html', htmlDeps);
  gulp.task('jscss', jscssDeps);
}

function defineImageTask(opt) {
  gulp.task('img', ['install'], function() {
    var dest = join(opt.dest, 'img');
    return pipe(
      gulp.src('**', {cwd: opt.img_src}),
      gulp.dest(dest)
    );
  });
}

function defineInstallTask(opt) {
  gulp.task('install', function(cb) {
    spm.install({
      source: opt.spm_source,
      query: []
    }, cb);
  });
}

function buildCSS(file, opt) {
  return function() {
  return pipe(
    gulp.src(file, opt),
    flatten(),
    gi(/\.less$/, less({
      paths: [path.dirname(file)]
    })),
    plugin.cssParser(opt),
    gulp.dest(opt.dest),
    gi(use('cssimg', opt), css.cssimg.gulp()),
    gi(use('peaches', opt), peaches()),
    gi(use('cssmin', opt), cssmin()),
    gulp.dest(opt.dest)
  );
  };
}

function buildJS(file, opt) {
  var isStandalone = opt.include === 'standalone' &&
      path.extname(file) === '.js';

  return function() {
  return pipe(
    umi.src(file, opt),
    gi(/\.less$/, less({
      paths: [path.dirname(file)]
    })),

    // seajs transport
    gi(/\.css$/, plugin.cssParser(opt)),
    gi(/\.css$/, plugin.css2jsParser(opt)),
    gi(/\.tpl$/, plugin.tplParser(opt)),
    gi(/\.json$/, plugin.jsonParser(opt)),
    gi(/\.handlebars$/, plugin.handlebarsParser(opt)),
    gi(/\.js$/, plugin.jsParser(opt)),
    umi.concat(),
    gi(isStandalone, standalonify(opt)),

    gi(use('uglify', opt), uglify()),
    flatten(),
    gulp.dest(opt.dest)
  );
  };
}

function buildHTML(file, opt) {
  return function() {
  return pipe(
    gulp.src(file, opt),
    flatten(),
    gulp.dest(opt.dest),
    gi(use('htmlgroup', opt), html.group.gulp()),
    gi(use('htmlinline', opt), html.inline.gulp()),
    gi(use('htmlimg', opt), html.htmlimg.gulp()),
    gulp.dest(opt.dest)
  );
  };
}

//////////////////////
// Helpers.

function getFiles() {
  var pkg = file.readJSON('package.json');
  if (pkg.spm && pkg.spm.output) {
    return _.uniq(pkg.spm.output);
  }
  return [];
}

function use(key, opt) {
  // only do publish build with --publish
  if (!opt.publish && opt["build_steps_in_publish"].indexOf(key) > -1) {
    return false;
  }

  if (!opt.builder[key]) {
    throw Error(util.format('key %s is invalid', key));
  }
  return opt.builder[key].enable;
}

function showLog(type, e) {
  var info = 'task ' + e.task;
  if (type === 'end') info = chalk.green(info);

  var time = e.duration ?
    chalk.green(' ✔') + chalk.gray(' (' + Math.floor(e.duration * 1000) + 'ms)') : '';

  log.info(type, info + time);
}
