'use strict';

var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var util = require('./util');

var CACHE_PATH = path.join(process.env.HOME, '.amb/cdncache/');
mkdirp.sync(CACHE_PATH);

module.exports = cdn;


function cdn(files, callback) {
  if (!util.isArray(files)) files = [files];
  var result = {};

  // Flow:
  // 1. read cache
  // 2. filter and upload uncached files
  // 3. concat cache and uncache results
  // 4. write cache
  // 5. callback

  // 1
  var md5hashs = util.md5(files);
  log('1: %s', md5hashs);
  // 2
  var uncacheFiles = files.filter(function(f, i) {
    var md5hash = md5hashs[i];
    var cacheFile = path.join(CACHE_PATH, md5hash);
    if (fs.existsSync(cacheFile)) {
      var url = fs.readFileSync(cacheFile, 'utf-8');
      if (url) result[f] = url;
      return false;
    } else {
      return true;
    }
  });
  log('1: uncacheFiles: %s', uncacheFiles);

  upload(uncacheFiles, function(e, urls) {
    if (e) throw Error(e);
    log('2: urls: %s', urls);
    // 3
    uncacheFiles.forEach(function(f, i) {
      result[f] = urls[i];
    });
    log('3: result: %s', result);

    // 4
    writeCache(result);

    // 5
    var urls = files.map(function(f) {
      return result[f];
    });
    callback && callback(null, urls);
  });
}

function upload(files, callback) {
  if (!files.length) return callback(null, []);
  util.cdn(files, function(e, urls) {
    if (!util.isArray(urls)) urls = [urls];
    callback(e, urls);
  }, true);
};

function writeCache(o, callback) {
  var files = Object.keys(o);
  var md5hashs = util.md5(files);
  files.map(function(f, i) {
    var md5hash = md5hashs[i];
    var url = o[f];
    var cacheFile = path.join(CACHE_PATH, md5hash);
    fs.writeFileSync(cacheFile, url);
  });
  callback && callback();
}

function log() {
  return;
  console.log.apply(console, arguments);
}
