var path = require('path');
var fs = require('fs');
var minifyJSON = require('node-json-minify');
var extend = require('extend');


//////////////////////
// Exports.

exports.get = function(cwd) {
  cwd = cwd || process.cwd();

  var defaultConfig = getJSONWithComments(path.join(__dirname, './defaultConfig.json'));
  var userConfig = require(path.join(cwd, 'package.json')).amb;
  return extend(defaultConfig, userConfig);
};


/////////////////////
// Helpers.

function getJSONWithComments(filepath) {
  var content = fs.readFileSync(filepath, 'utf-8');
  return JSON.parse(minifyJSON(content));
}
