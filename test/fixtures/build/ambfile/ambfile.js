var through = require('through2');
var fs = require('fs');
var join = require('path').join;

exports.startStream = function(args) {
  return through.obj(function(file, enc, callback) {
    var code = String(file.contents);
    code = code.replace('a@0.1.0', 'ambfile');
    file.contents = new Buffer(code);
    callback(null, file);
  });
};

exports.endStream = function(args) {
  return through.obj(function(file, enc, callback) {
    var code = String(file.contents);
    code = code.replace('ambfile', 'ambfile + dest');
    file.contents = new Buffer(code);
    callback(null, file);
  });
};

exports.startTask = function(args) {
  return function() {
    fs.writeFileSync(join(__dirname, 'start'), 'start', 'utf-8');
  };
};

exports.endTask = function(args) {
  return function() {
    fs.writeFileSync(join(__dirname, 'end'), 'end', 'utf-8');
  };
};
