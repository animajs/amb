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

util.md5 = function(files, callback) {
  if (!util.isArray(files)) {
      files = [files];
  }

  var results = {};

  // FIXME: 用 async.concat 死活不成功，先自己实现一个.
  var next = function(file, d) {
    if (Object.keys(results).length != files.length) return;
    callback(null, files.map(function(f) {
      return results[f];
    }));
  };

  files.forEach(function md5_handler(file) {
    var md5sum = crypto.createHash('md5');
    var s = fs.ReadStream(file);
    s.on('data', function(d) {
        md5sum.update(d);
    });
    s.on('end', function() {
      var d = md5sum.digest('hex');
      results[file] = d;
      next();
    });
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
