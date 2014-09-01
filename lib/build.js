require('colorful').colorful();
var fs = require('fs');
var path = require('path');
var umi = require('umi');
var join = require('path').join;
var glob = require('glob');
var uniq = require('array-uniq');
var spmrc = require('spmrc');
var log = require('spm-log');
var multipipe = require('multipipe');
var gulp = require('gulp');
var standalonify = require('spm-standalonify');
var through = require('through2');
var template = require('./utils/template');
var $ = require('gulp-load-plugins')({
  config: require('../package.json')
});

module.exports = function(opts, cb) {
  var args = umi.buildArgs(opts);
  logArgs(args);

  // load ambfile
  var ambfile = join(args.cwd, 'ambfile.js');
  args.ambfile = {};
  if (fs.existsSync(ambfile)) {
    args.ambfile = require(ambfile);
  }

  // define task
  defineCleanTask(args);
  definePrecompileTasks(args);
  defineBuildTask(args);

  gulp
    .on('task_start', function(e) {showLog('start', e);})
    .on('task_stop', function(e) {showLog('end', e);});

  gulp.start('build', cb);
};


//////////////////
// Tasks

function defineCleanTask(args) {
  gulp.task('clean', function() {
    return args.force && gulp.src(args.dest)
      .pipe($.clean({force: true}));
  });
}

function definePrecompileTasks(args) {
  var lessFiles = getLessFiles(args);
  gulp.task('less', ['clean'], function() {
    if (!lessFiles.length) return;
    return pipe(
      gulp.src(lessFiles, {cwd:args.cwd, base:args.cwd}),
      $.less(args.lessOpts || {paths: [args.cwd]}),
      gulp.dest(args.cwd)
    );
  });

  var coffeeFiles = getCoffeeFiles(args);
  gulp.task('coffee', ['clean'], function() {
    if (!coffeeFiles.length) return;
    return pipe(
      gulp.src(coffeeFiles, {cwd:args.cwd, base:args.cwd}),
      $.coffee(args.coffeeOpts),
      gulp.dest(args.cwd)
    );
  });
}

function defineBuildTask(args) {
  gulp.task('build', ['less', 'coffee'], function() {

    try {
      var pkg = new umi.Package(args.cwd, {
        skip: args.skip,
        ignore: args.ignore,
        moduleDir: spmrc.get('install.path')
      });

      log.info('package', 'analyse infomation');
      log.info('package', 'dependencies: ' + Object.keys(pkg.dependencies));
      log.info('package', 'files: ' + Object.keys(pkg.files));
      args.pkg = pkg;
    } catch(err) {
    }

    var files = getFiles(pkg);
    log.info('output', 'files: ' + files);

    var isStandalone;
    if (args.include === 'standalone') {
      isStandalone = true;
      args.include = 'all';
    }
    if (args.include === 'umd') {
      isStandalone = true;
      args.include = 'all';
      // use package name as global name for umd
      args.umd = camelCase(args.pkg.name);
    }

    // add {{name}} and {{version}} support for pathmap
    if (args.pathmap) {
      args.pathmap = template(args.pathmap, pkg);
    }

    var opt = umi.util.extendOption(args);
    var optDebug = umi.util.extendOption(args);
    optDebug.rename = {'suffix': '-debug'};

    return pipe(
      gulp.src(files, {cwd:opt.cwd, base:opt.cwd}),
      args.ambfile.startStream ? args.ambfile.startStream(args) : through.obj(),

      // transport css and js
      $.if(isCSSorJS, $.mirror(
        // normal
        pipe(
          $.transport(opt),
          $.if(isJS, pipe(
            $.if(isStandalone, standalonify(args)),
            $.uglify(args.uglifyOpts)
          ), $.cssmin(args.cssminOpts))
        ),

        // debug
        pipe(
          $.transport(optDebug),
          $.if(isJS, pipe(
            $.if(isStandalone, standalonify(args))
          ))
        )
      )),

      $.transport.plugin.dest(opt),
      args.pathmap ? $.pathmap(args.pathmap) : through.obj(),
      args.ambfile.endStream ? args.ambfile.endStream(args) : through.obj(),
      gulp.dest(args.dest)
    );
  });
}

//////////////////
// Utils

function getFiles(pkg) {
  var files = [];
  if (Array.isArray(pkg.output)) {
    pkg.output.forEach(function(_glob) {
      var items = glob.sync(_glob, {cwd: pkg.dest});
      files = files.concat(items);
    });
  }
  return uniq(files);
}

function getLessFiles(args) {
  var pkg = require(join(args.cwd, 'package.json'));
  var files = [];
  if (Array.isArray(pkg.spm.output)) {
    pkg.spm.output.forEach(function(_glob) {
      _glob = _glob.replace(/\.css$/, '.less');
      var items = glob.sync(_glob, {cwd: args.cwd});
      files = files.concat(items);
    });
  }
  return uniq(files).filter(function(file) {
    return path.extname(file) === '.less';
  });
}

function getCoffeeFiles(args) {
  var pkg = require(join(args.cwd, 'package.json'));
  var files = [];
  if (Array.isArray(pkg.spm.output)) {
    pkg.spm.output.forEach(function(_glob) {
      _glob = _glob.replace(/\.js/, '.coffee');
      var items = glob.sync(_glob, {cwd: args.cwd});
      files = files.concat(items);
    });
  }
  return uniq(files).filter(function(file) {
    return path.extname(file) === '.coffee';
  });
}

function pipe() {
  return multipipe.apply(null, arguments)
    .on('data', function() {});
}

function showLog(type, e) {
  var info = 'task ' + e.task;
  if (type === 'end') info = info.to.green.color;
  log.info(type, info);
}

function logArgs(args) {
  Object.keys(args)
    .forEach(function(key) {
      var val = args[key];
      if (typeof val === 'object') {
        val = JSON.stringify(val);
      }
      log.info('arguments', key + ' = ' + val);
    });
}

function isJS(file) {
  return path.extname(file.path) === '.js';
}

function isCSSorJS(file) {
  return path.extname(file.path) === '.js' ||
    path.extname(file.path) === '.css';
}

function camelCase(str) {
  return str.replace(/[_.-](\w|$)/g, function (_,x) {
    return x.toUpperCase();
  });
}
