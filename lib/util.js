'use strict';

var fs = require('fs');
var path = require('path');
var cdn = require('cdn');
var mkdirp = require('mkdirp');
var async = require('async');
var request = require('request');
var _util = require('util');

var util = module.exports = {};

util.upload = function(str, ext, next) {
  var r = +new Date() + Math.floor(Math.random() * 1000);
  var filepath = path.join(process.env.HOME, '.amb/tmp/'+r+'.'+ext);

  // Upload steps:
  // 1. mkdir if not exist
  // 2. write
  // 3. upload with cdn
  mkdirp.sync(path.dirname(filepath));
  fs.writeFileSync(filepath, str);
  cdn(filepath, next);
};

util.getData = function(urls, next) {
  if (!this.isArray(urls)) {
    urls = [urls];
  }
  async.concatSeries(urls, function(url, cb) {
    request(url, function(err, res, body) {
      cb(err, body);
    });
  }, function(err, files) {
    next(err, files && files.join('\n'));
  });
};

// type: css, js
util.groupHTML = function(html, newUrl, type, urls, group) {
  if (type != 'css' && type != 'js') {
    throw Error('known type: ' + type);
  }

  function getReg(url) {
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
    var reg = getReg(url);
    html = html.replace(reg, newSubStr);
  });

  return html;
};

util.removeExt = function(filepath) {
  var index = filepath.lastIndexOf('.');
  return filepath.slice(0, index);
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
