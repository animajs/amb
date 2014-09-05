var path = require('path');
var fs = require('fs');
var minifyJSON = require('node-json-minify');


//////////////////////
// Exports.

exports.get = function(cwd) {
  cwd = cwd || process.cwd();

  var defaultConfig = getJSONWithComments(path.join(__dirname, './defaultConfig.json'));
  var userConfig = require(path.join(cwd, 'package.json')).spm;
  return extendExist(defaultConfig, userConfig);
};


/////////////////////
// Helpers.

function getJSONWithComments(filepath) {
  var content = fs.readFileSync(filepath, 'utf-8');
  return JSON.parse(minifyJSON(content));
}

function extendExist(source, obj) {
  var ret = {};
  for (var k in source) {
    ret[k] = obj[k] || source[k];
  }
  return ret;
}
