'use strict';

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
var extend = require('extend');
var checkonline = require('checkonline');
var install = require('co')(require('spm-client').install);

var autoprefixer = require('gulp-autoprefixer');
var cssmin = require('gulp-cssmin');
var transport = require('gulp-transport');
var gulpif = require('gulp-if');
var mirror = require('gulp-mirror');
var pathmap = require('gulp-pathmap');
var clean = require('gulp-clean');
var less = require('gulp-less');
var coffee = require('gulp-coffee');
var uglify = require('gulp-uglify');
var slash = require('gulp-slash');

module.exports = function(opts, cb) {
  var args = umi.buildArgs(opts);
  args = extend(require('./config').get(args.cwd), args);
  logArgs(args);

  // load spmfile
  var spmfile = join(args.cwd, 'spmfile.js');
  args.spmfile = {};
  if (fs.existsSync(spmfile)) {
    args.spmfile = require(spmfile);
  }

  // define task
  defineCleanTask(args);
  defineInstallTask(args);
  defineCustomTasks(args);
  definePrecompileTasks(args);
  defineBuildTask(args);
  defineCheckOnlineTask(args);

  gulp
    .on('task_start', function(e) {showLog('start', e);})
    .on('task_stop', function(e) {showLog('end', e);});

  gulp.start('checkonline', cb);
};


//////////////////
// Tasks

function defineCheckOnlineTask(args) {
  gulp.task('checkonline', ['endTask'], function(callback) {
    var isRelative = args.include === 'relative';
    var currPkg = args.pkg.name + '/' + args.pkg.version;

    checkonline({
      cwd: args.cwd,
      server: 'https://a.alipayobjects.com',
      statusCode: 404,
      withDeps: isRelative
    }, function(err, files) {
      if (err) {
        return callback(err);
      }

      // Check if dependencies pkgs is online
      if (isRelative) {
        var pkgs = files
          // is not online and not current pkg
          .filter(function(f) {return !f.isOnline && f.filepath.indexOf(currPkg) !== 0;})
          // get pkg list in `name@version`
          .map(function(f) {return f.filepath.split('/').slice(0,2).join('@')});
        pkgs = uniq(pkgs);
        if (pkgs.length) {
          log.warn('checkonline', 'These deps are not published: ' + pkgs.join(', ').to.yellow.color);
        }
      }

      if (files.filter(isCurrentPkgPublished).length) {
        var errMsg = 'This version '+(args.pkg.name+'@'+args.pkg.version)+' is already published!';
        return callback(new Error(errMsg));
      }

      callback();

      function isCurrentPkgPublished(f) {
        return f.filepath.indexOf(currPkg) === 0 && f.isOnline;
      }
    });
  });
}

function defineCleanTask(args) {
  gulp.task('clean', function() {
    return args.force && gulp.src(args.dest)
      .pipe(clean({force: true}));
  });
}

function defineInstallTask(args) {
  gulp.task('install', args.install ? function(callback) {
    var opts = {
      cwd: args.cwd,
      registry: args.registry
    };
    install(opts, callback);
  } : noop);
}

function defineCustomTasks(args) {
  gulp.task('startTask', ['clean'],
    args.spmfile.startTask ? args.spmfile.startTask(args) : function(){});
  gulp.task('endTask', ['build'],
    args.spmfile.endTask ? args.spmfile.endTask(args) : function(){});
}

function definePrecompileTasks(args) {
  var lessFiles = getLessFiles(args);
  gulp.task('less', ['startTask'], function() {
    if (!lessFiles.length) return;
    return pipe(
      gulp.src(lessFiles, {cwd:args.cwd, base:args.cwd}),
      less(args.lessOpts || {paths: [args.cwd]}),
      gulp.dest(args.cwd)
    );
  });

  var coffeeFiles = getCoffeeFiles(args);
  gulp.task('coffee', ['startTask'], function() {
    if (!coffeeFiles.length) return;
    return pipe(
      gulp.src(coffeeFiles, {cwd:args.cwd, base:args.cwd}),
      coffee(args.coffeeOpts),
      gulp.dest(args.cwd)
    );
  });
}

function defineBuildTask(args) {
  gulp.task('build', ['less', 'coffee', 'install'], function(cb) {
    build(args, cb);
  });
}

function build(args, cb) {
  try {
    var pkg = new umi.Package(args.cwd, {
      skip: args.skip,
      ignore: args.ignore,
      moduleDir: spmrc.get('install.path')
    });

    if (!args.noPkgLog) {
      log.info('package', 'analyse infomation');
      log.info('package', 'dependencies: ' + Object.keys(pkg.dependencies));
      log.info('package', 'files: ' + Object.keys(pkg.files));
    }
    args.pkg = pkg;
  } catch(err) {
    cb(err);
  }

  var files = getFiles(pkg);
  log.info('output', 'files: ' + files);

  // check duplicatate
  checkDuplicate(files, pkg);

  // build package in dependencies
  var depFiles = {};
  if (args.withDeps) {
    var depPkgs = getAllDependencies(pkg);
    for (var id in depPkgs) {
      files = files.concat(getFiles(depPkgs[id]).map(function(f) {
        var filepath = spmrc.get('install.path') + '/' + id.replace('@','/') + '/' + f;
        depFiles[filepath] = depPkgs[id].files[f];
        return filepath;
      }));
    }
    log.info('withDeps', 'files: ' + files);
  }

  // check ext deps and install
  if (!args.noExtCheck) {
    var extDeps = getExtDeps(files, pkg, depFiles);
    if (extDeps.length) {
      log.info('extDeps', extDeps.join(','));
    }
    if (extDeps.length) {
      return install({
        cwd: args.cwd,
        save: true,
        name: extDeps
      }, function(err) {
        if (err) {
          return cb(err);
        }
        args.noExtCheck = args.noPkgLog = true;
        build(args, cb);
      });
    }
  }

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
    args.spmfile.startStream ? args.spmfile.startStream(args) : through.obj(),

    // transport css and js
    gulpif(isCSSorJS, mirror(
      // normal
      pipe(
        transport(opt),
        gulpif(isJS, pipe(
          gulpif(isStandalone, standalonify(args)),
          uglify(args.uglifyOpts)
        ), pipe(
          gulpif(args.autoprefixer, autoprefixer(args.autoprefixer)),
          cssmin(args.cssminOpts)
        ))
      ),

      // debug
      pipe(
        transport(optDebug),
        gulpif(isJS, pipe(
          gulpif(isStandalone, standalonify(args))
        ), pipe(
          gulpif(args.autoprefixer, autoprefixer(args.autoprefixer))
        ))
      )
    )),

    transport.plugin.dest(opt),
    slash(),
    args.pathmap ? pathmap(args.pathmap) : through.obj(),
    args.spmfile.endStream ? args.spmfile.endStream(args) : through.obj(),
    gulp.dest(args.dest)
  ).on('end', cb);
}

//////////////////
// Utils

function getFiles(pkg) {
  var files = [];
  if (fs.existsSync(path.join(pkg.dest, pkg.main))) {
    files.push(pkg.main);
  }
  pkg.output.forEach(function(_glob) {
    var items = glob.sync(_glob, {cwd: pkg.dest});
    files = files.concat(items);
  });
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

function template(format, data) {
  return format.replace(/{{([a-z]*)}}/g, function(all, match) {
    return data[match] || '';
  });
}

function noop() {}

function getAllDependencies(pkg) {
  var result = {};
  recurseDependencies(pkg);
  return result;

  function recurseDependencies(pkg) {
    Object.keys(pkg.dependencies).forEach(function(key) {
      var id = pkg.dependencies[key].id;
      if (!result[id]) {
        result[id] = pkg.dependencies[key];
        recurseDependencies(pkg.dependencies[key]);
      }
    });
  }
}

function getExtDeps(files, pkg, depFiles) {
  var extDeps = {};
  files.forEach(function(f) {
    if (path.extname(f) !== '.js') return;
    var file = depFiles[f] || pkg.files[f];
    if (!file) return;
    if (!pkg.dependencies['import-style'] && file.hasExt('css')) {
      extDeps['import-style'] = true;
    }
    if (!pkg.dependencies['handlebars-runtime'] && file.hasExt('handlebars')) {
      extDeps['handlebars-runtime'] = true;
    }
  });
  return Object.keys(extDeps);
}

function checkDuplicate(files, pkg) {
  var rootPkgName = pkg.name;

  files.forEach(function(f) {
    var dup = {};
    var file = pkg.files[f];

    file.lookup(function(fileInfo) {
      var name = fileInfo.pkg.name;
      var version = fileInfo.pkg.version;
      if (name === rootPkgName) return;
      dup[name] = dup[name] || {};
      dup[name][version] = true;
    });

    for (var k in dup) {
      var versions = Object.keys(dup[k]);
      if (versions.length > 1) {
        log.warn('dulplicate',
          '%s (%s) while building %s'.to.yellow.color,
          k,
          versions.join(', '),
          file.path
        );
      }
    }
  });
}

