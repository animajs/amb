'use strict';

var fs = require('fs');
var path = require('path');
var cdn = require('cdn');
var mkdirp = require('mkdirp');
var async = require('async');
var request = require('request');
var crypto = require('crypto');
var _util = require('util');

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
  this.cdn(filepath, cb);
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

  urls.forEach(function(url, index) {
    var newSubStr = '';
    var groupInfo = group ? ' group="'+group+'"' : '';
    if (index === 0) {
      newSubStr = type === 'css'
        ? '<link'+groupInfo+' rel="stylesheet" href="'+newUrl+'" />'
        : '<script'+groupInfo+' src="'+newUrl+'"></script>';
    }
    var re = getRegexp(url);
    html = html.replace(re, newSubStr);
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
