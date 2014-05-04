'use strict';

var peaches = require('peaches');
var es = require('event-stream');

module.exports = function gulpPeaches() {

  var options = {
    server: {
      "name": "tfs",
      // "name": "alipay",
      // "bizName": "xingmin.zhu",
      // "token":"xingmin.zhu",
      "root": "./tmp",
      "tmp": "./tmp"
    }
  };

  return es.map(function(file, cb) {
    var content = String(file.contents);
    peaches(content, options, function(err, newContent) {
      file.contents = new Buffer(newContent);
      cb(null, file);
    });
  });
};
