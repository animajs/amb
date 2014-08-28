var through = require('through2');

exports.afterSrc = function(args) {

  return through.obj(function(file, enc, callback) {
    var code = String(file.contents);
    code = code.replace('a@0.1.0', 'ambfile');
    file.contents = new Buffer(code);
    callback(null, file);
  });
};

exports.beforeDest = function(args) {

  return through.obj(function(file, enc, callback) {
    var code = String(file.contents);
    code = code.replace('ambfile', 'ambfile + dest');
    file.contents = new Buffer(code);
    callback(null, file);
  });
};
