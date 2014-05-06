'use strict';

var fs = require('fs');
var path = require('path');
var cdn = require('cdn');
var mkdirp = require('mkdirp');
var async = require('async');
var request = require('request');
var crypto = require('crypto');
var _util = require('util');
var _ = require('lodash');
var cheerio = require('cheerio');

var util = module.exports = {};

util.cdn = cdn;

util.upload = function(str, ext, cb) {
  var r = +new Date() + Math.floor(Math.random() * 1000);
  var filepath = path.join(process.env.HOME, '.amb/tmp/'+r+'.'+ext);

  // Upload steps:
  // 1. mkdir if not exist
  // 2. write
  // 3. upload with cdn
  mkdirp.sync(path.dirname(filepath));
  fs.writeFileSync(filepath, str);
  this.cdn(filepath, cb, true);
};

util.getData = function(urls, cb) {
  if (!this.isArray(urls)) {
    urls = [urls];
  }
  async.concatSeries(urls, function(url, next) {
    request(url, function(err, res, body) {
      next(err, body);
    });
  }, function(err, files) {
    cb(err, files && files.join('\n'));
  });
};

// type: css, js
util.groupHTML = function(html, newUrl, type, urls, group) {
  if (type != 'css' && type != 'js') {
    throw Error('known type: ' + type);
  }

  function getRegexp(url) {
    if (type === 'css') {
      return new RegExp('<link[^>]+?'+url+'.*?>', 'i');
    } else {
      return new RegExp('<script[^>]+?'+url+'.+?<\/script>', 'i');
    }
  }

  function getNewStr(str, index, type, newUrl) {
    if (index != 0) return '';

    var tag  = type === 'css' ? 'link' : 'script';
    var attr = type === 'css' ? 'href' : 'src';

    var $ = cheerio.load(str);
    $(tag).attr(attr, newUrl);

    return $.html();
  }

  urls.forEach(function(url, index) {
    var newSubStr = '';
    var groupInfo = group ? ' group="'+group+'"' : '';
    if (index === 0) {
      newSubStr = type === 'css'
        ? '<link'+groupInfo+' rel="stylesheet" href="'+newUrl+'" />'
        : '<script'+groupInfo+' src="'+newUrl+'"></script>';
    }
    var re = getRegexp(url);
    html = html.replace(re, function(str) {
      return getNewStr(str, index, type, newUrl);
    });
  });

  return html;
};

util.removeExt = function(filepath) {
  var index = filepath.lastIndexOf('.');
  return filepath.slice(0, index);
};

util.md5 = function(files) {
  if (!util.isArray(files)) {
      files = [files];
  }
  return files.map(function md5Handler(str) {
    var md5sum = crypto.createHash('md5');
    return md5sum.update(str).digest('hex');
  });
};

util.extendOption = function(r, s) {
  for (var k in s) {
    if (!r[k]) continue;
    // boolean
    if (typeof s[k] === 'boolean') {
      r[k].enable = s[k];
      continue;
    }
    // object
    if (typeof s[k] === 'object') {
      if ('enable' in s[k]) r[k].enable = s[k].enable;
      if ('opt' in s[k]) r[k].opt = s[k].opt;
    }
  }
  return r;
};

var RE_HTML = /\.html$/;
var RE_CSS  = /\.(css|less|sass)$/;
var RE_JS   = /\.(js|coffee)$/;

util.isHTMLFile = function(file) {
  return RE_HTML.test(file);
};

util.isCSSFile = function(file) {
  return RE_CSS.test(file);
};

util.isJSFile = function(file) {
  return RE_JS.test(file);
};


// Map these keys to util
var keys = [
  'format',
  'log', 'print', 'debug', 'error',
  'inherits', 'inspect',
  'isArray', 'isDate', 'isError', 'isRegExp',
  'pump', 'puts'
];
keys.forEach(function(key) {
  util[key] = _util[key].bind(_util);
});
