'use strict';

var fs = require('fs');
var path = require('path');
var cdn = require('cdn');
var mkdirp = require('mkdirp');

var util = module.exports = {};

util.upload = function(str, ext, cb) {
  var r = +new Date() + Math.floor(Math.random() * 1000);
  var filepath = path.join(process.env.HOME, '.amb/tmp/'+r+'.'+ext);

  // Upload steps:
  // 1. mkdir if not exist
  // 2. write
  // 3. upload with cdn
  mkdirp.sync(path.dirname(filepath));
  fs.writeFileSync(filepath, str);
  cdn(filepath, cb);
};

util.removeExt = function(filepath) {
  var index = filepath.lastIndexOf('.');
  return filepath.slice(0, index);
};
