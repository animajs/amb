'use strict';

var util = module.exports = {};

var RE_HTML = /\.(html|htm)$/;
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
  var _util = require('util');
  util[key] = _util[key].bind(_util);
});
