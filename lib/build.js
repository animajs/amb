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
var $ = require('gulp-load-plugins')({
  config: require('../package.json')
});

module.exports = function(opts, cb) {
  var args = umi.buildArgs(opts);
  logArgs(args);

  // define task
  defineCleanTask(args);
  definePrecompileTask(args);
  defineBuildTask(args);

  gulp
    .on('task_start', function(e) {showLog('start', e);})
    .on('task_stop', function(e) {showLog('end', e);})
    .on('task_err', function(e) {cb(e.err);})
    .on('err', function(e) {cb(e.err);});

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

function definePrecompileTask(args) {
  var lessFiles = getLessFiles(args);
  var coffeeFiles = getCoffeeFiles(args);

  gulp.task('precompile', ['less', 'coffee']);

  gulp.task('less', ['clean'], function() {
    return pipe(
      gulp.src(lessFiles),
      $.less({paths: [args.cwd]}),
      gulp.dest('./')
    );
  });

  gulp.task('coffee', ['clean'], function() {
    return pipe(
      gulp.src(coffeeFiles),
      $.coffee(args.coffeeOpts),
      gulp.dest('./')
    );
  });
}

function defineBuildTask(args) {
  gulp.task('build', ['precompile'], function() {

    try {
      var pkg = new umi.Package(args.cwd, {
        skip: args.skip || [],
        ignore: args.ignore || [],
        moduleDir: spmrc.get('install.path')
      });

      if (!args.noPkgLog) {
        log.info('package', 'analyse infomation');
        log.info('package', 'dependencies: ' + Object.keys(pkg.dependencies));
        log.info('package', 'files: ' + Object.keys(pkg.files));
      }
      args.pkg = pkg;
    } catch(err) {
      return cb(err);
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

    var opt = umi.util.extendOption(args);
    var optDebug = umi.util.extendOption(args);
    optDebug.rename = {'suffix': '-debug'};

    return pipe(
      gulp.src(files, {cwd:opt.cwd, base:opt.cwd}),

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
      gulp.dest(args.dest)
    );
  });
}

//////////////////
// Utils

function getFiles(pkg) {
  var files = [];
  if (fs.existsSync(join(pkg.dest, pkg.main))) {
    files.push(pkg.main);
  }
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
      log.info('arguments', key + ' = ' + args[key]);
    });
}

function isJS(file) {
  return path.extname(file.path) === '.js';
}

function isCSSorJS(file) {
  return path.extname(file.path) === '.js' ||
    path.extname(file.path) === '.css';
}
