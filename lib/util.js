'use strict';

var _util = require('util');

var util = module.exports = {};

util.removeExt = function(filepath) {
  var index = filepath.lastIndexOf('.');
  return filepath.slice(0, index);
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

util.isHTML = function(file) {
  return RE_HTML.test(file);
};

util.isCSS = function(file) {
  return RE_CSS.test(file);
};

util.isJS = function(file) {
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
