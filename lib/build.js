var path = require('path');
var chalk = require('chalk');
var join = path.join;
var log = require('../lib/log');
var util = require('../lib/util');
var spm = require('spm');
var file = spm.sdk.file;
var _ = require('lodash');
var pipe = require('multipipe');
var glob = require('glob');

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
var cssimg = require('gulp-cssimg');
var htmlimg = require('gulp-htmlimg');
var htmlinline = require('gulp-htmlinline');
var htmlgroup = require('gulp-htmlgroup');
var hfa = require('gulp-htmlflattenassets');
var clean = require('gulp-clean');

var utc = require('@alipay/upload-to-cdn');

var gulp;
var uploader;

module.exports = function(opt, _gulp, cb) {
  gulp = _gulp;

  opt = umi.buildArgs(opt);
  opt = umi.util.extendOption(opt);

  // Init uploader
  uploader = function(file) {
    var basedir = path.dirname(file);
    return function(files, callback) {
      files = files.map(function(item) {
        return join(basedir, item);
      });
      utc(files, {
        type: opt.uploadEngine || 'cdn',
        callback: callback
      });
    };
  };

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
  defineInstallTask(opt);
  defineCleanTask(opt);

  gulp
    .on('task_start', function(e) {showLog('start', e);})
    .on('task_stop', function(e) {showLog('end', e);})
    .on('task_err', function(e) {cb(e.err);})
    .on('err', function(e) {cb(e.err);});

  gulp.task('default', ['prepare', 'clean', 'install', 'jscss', 'html']);
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
      gulp.task(name, ['install'], buildCSS(file, opt));
      jscssDeps.push(name);
    } else if (util.isJS(file)) {
      gulp.task(name, ['install'], buildJS(file, opt));
      jscssDeps.push(name);
    }
  });

  gulp.task('html', htmlDeps);
  gulp.task('jscss', jscssDeps);
}

function defineInstallTask(opt) {
  gulp.task('install', ['clean'], function(cb) {
    spm.install({
      source: opt.spm_source,
      query: []
    }, cb);
  });
}

function defineCleanTask(opt) {
  gulp.task('clean', function() {
    if (opt.force) {
      return pipe(
        gulp.src(opt.dest + '*'),
        clean()
      ).on('data', function(){});
    }
  });
}

function buildCSS(file, opt) {
  return function() {
    return pipe(
      gulp.src(file, opt),
      gi(/\.less$/, less({
        paths: [path.dirname(file)]
      })),
      plugin.cssParser(opt),
      gi(use('cssimg', opt), cssimg(uploader(file))),
      gi(use('peaches', opt), peaches()),
      gi(use('cssmin', opt), cssmin()),
      gi(use('flatten', opt), flatten()),
      gulp.dest(opt.dest)
    ).on('data', function(){});
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
      gi(use('flatten', opt), flatten()),
      gulp.dest(opt.dest)
    ).on('data', function(){});
  };
}

function buildHTML(file, opt) {
  return function() {
    return pipe(
      gulp.src(file, opt),
      gi(use('htmlgroup', opt), htmlgroup(uploader(file))),
      gi(use('htmlinline', opt), htmlinline()),
      gi(use('htmlimg', opt), htmlimg(uploader(file))),
      gi(use('flatten', opt), flatten()),
      gi(use('flatten', opt), hfa()),
      gulp.dest(opt.dest)
    ).on('data', function(){});
  };
}

//////////////////////
// Helpers.

function getFiles(pkg) {
  try {
    var output = file.readJSON('package.json').spm.output;
  } catch(e) {
    var output = [];
  }
  var files = [];
  if (Array.isArray(output) && output.length) {
    output.forEach(function (outputGlob) {
      var items = glob.sync(outputGlob, {cwd: pkg.dest});
      files = files.concat(items);
    });
  }
  return _.uniq(files);
}

function use(key, opt) {
  // only do publish build with --publish
  if (!opt.publish && opt["build_steps_in_publish"].indexOf(key) > -1) {
    return false;
  }

  if (key === 'flatten') {
    return opt.flatten;
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
