'use strict';

var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var minifyJSON = require('node-json-minify');


//////////////////////
// Exports.

exports.get = function() {
  var dc = getJSONWithComments(path.join(__dirname, './defaultConfig.json'));
  var pc = require(path.join(process.cwd(), 'package.json')).amb;
  return mergeConfig(dc, pc);
};


/////////////////////
// Helpers.

function getJSONWithComments(filepath) {
  var content = fs.readFileSync(filepath, 'utf-8');
  return JSON.parse(minifyJSON(content));
}

function mergeConfig(d, s) {
  d = merge(d, s, ['builder']);
  d.builder = merge(d.builder, s.builder);
  return d;
}

function merge(d, s, bl) {
  for (var k in s) {
    // don't set val for nonexist properties
    if (!(k in d)) continue;
    // _ is for inner properties
    if (k.charAt(0) === '_') continue;

    if (bl && bl.indexOf(k) > -1) continue;
    d[k] = s[k];
  }
  return d;
}
