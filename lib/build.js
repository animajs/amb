'use strict';

var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var _ = require('lodash');
var umi = require('umi');
var transport = umi.transport;
var util = require('./util');
var html = require('./html');
var css = require('./css');

// gulp plugins
var gi = require('gulp-if');
var less = require('gulp-less');
var wrapper = require('gulp-wrapper');
var cssmin = require('gulp-cssmin');
var uglify = require('gulp-uglify');
var coffee = require('gulp-coffee');
var imgmin = require('gulp-imagemin');
var flatten = require('gulp-flatten');


//////////////////////
// Exports.

exports.buildFile = function(file, opt, cb) {
  var extname = path.extname(file).slice(1);
  var b = builder[extname];
  if (!b) {
    throw Error(util.format('no builder for %s exists!', extname));
  }

  opt = umi.util.extendOption(opt);
  return b(file, opt, cb);
};

exports.buildImg = function(opt, cb) {
  var glob = opt['img_dir'] + '**/**';
  var dest = path.join(opt['dest'], 'img');

  return gulp.src('./src/img/*.png')
    .pipe(gi(use('imgmin', opt), imgmin()))
    .pipe(gulp.dest(dest))
    .on('end', cb);
};


//////////////////////
// Builder.

var builder = {};

builder.html = function(file, opt, cb) {
  return gulp.src(file)
    .pipe(flatten())
    .pipe(gulp.dest(opt.dest))
    .pipe(gi(use('htmlgroup', opt), html.group.gulp()))
    .pipe(gi(use('htmlinline', opt), html.inline.gulp()))
    .pipe(gi(use('htmlimg', opt), html.htmlimg.gulp()))
    .pipe(gulp.dest(opt.dest))
    .on('end', cb);
};

builder.css = function(file, opt, cb) {
  return gulp.src(file)
    .pipe(gi(/\.less$/, less()))
    .pipe(gi(/\.css$/, transport.cssParser(opt)))
    .pipe(gi(use('cssimg', opt), css.cssimg.gulp()))
    .pipe(gi(use('peaches', opt), css.peaches()))
    .pipe(gi(use('cssmin', opt), cssmin()))
    .pipe(flatten())
    .pipe(gulp.dest(opt.dest))
    .on('end', cb);
};

builder.js = function(file, opt, cb) {
  var header = fs.readFileSync(path.join(__dirname, './template/build/header.tpl'));
  var footer = getFooter(file, opt);

  return umi.src(file, opt)
    .pipe(gi(/\.less$/, less()))

    // seajs transport
    .pipe(gi(/\.css$/, transport.cssParser(opt)))
    .pipe(gi(/\.css$/, transport.css2jsParser(opt)))
    .pipe(gi(/\.tpl$/, transport.tplParser(opt)))
    .pipe(gi(/\.json$/, transport.jsonParser(opt)))
    .pipe(gi(/\.handlebars$/, transport.handlebarsParser(opt)))
    .pipe(gi(/\.js$/, transport(opt)))
    .pipe(umi.concat())

    .pipe(wrapper({header:header,footer:footer}))
    .pipe(gi(!opt.bare, wrapper({header:';(function() {\n',footer:'\n})();\n'})))
    .pipe(gi(use('uglify', opt), uglify()))
    .pipe(flatten())
    .pipe(gulp.dest(opt.dest))
    .on('end', cb);
};

// alias
builder.less = builder.sass = builder.css;
builder.coffee = builder.js;


//////////////////////
// Helpers.

function use(key, opt) {
  console.log('  key: %s', key);
  // only do publish build with --publish
  if (!opt.publish && opt["build_steps_in_publish"].indexOf(key) > -1) {
    console.log('     false');
    return false;
  }

  if (!opt.builder[key]) {
    throw Error(util.format('key %s is invalid', key));
  }
  return opt.builder[key].enable;
}

function getFooter(file, opt) {
  var pkg = opt.pkg;
  var tplFile = opt.standalone
    ? './template/build/footer-standalone.tpl'
    : './template/build/footer.tpl';
  var tpl = fs.readFileSync(path.join(__dirname, tplFile), 'utf-8');
  var html = _.template(tpl)({
    main: pkg.name+'/'+pkg.version+'/'+util.removeExt(file),
    standalone: opt.standalone
  });
  return html;
}
