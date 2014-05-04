'use strict';

var debug = require('debug')('amb:html:relative-css-img');
var gulp = require('gulp');
var path = require('path');
var _ = require('lodash');
var es = require('event-stream');
var util = require('../util');
var cdn = require('../cdn');

module.exports = main;

function main(content, basedir, cb) {
  basedir = basedir || path.join(__dirname, './');
  cb = cb || function() {};

  var images = getImages(content);

  if (images.length) {
    var _images = images.map(function(f) {
      return path.join(basedir, f);
    });
    cdn(_images, function(e, urls) {
      if (e) throw Error(e);
      content = replaceContent(images, urls, content);
      cb(null, content);
    });

  } else {
    return cb(null, content), content;
  }
}

main.gulp = function() {
  return es.map(function(file, cb) {
    main(String(file.contents), path.dirname(file.path), function(err, content) {
      file.contents = new Buffer(content);
      cb(null, file);
    });
  });
};


/////////////////
// Helpers.

function getImages(content) {
  var re = /url\((.*?(gif|png|jpg|jpeg).*?)\)/gi;
  var m;
  var images = [];

  while (m = re.exec(content)) {
    var src = m[1];
    src = src.trim();
    src = src.replace(/^["']|["']$/g, '');
    var isRelative = !/^https?:\/\//.test(src);
    if (isRelative) {
      images.push(src);
    }
  }

  return _.uniq(images);
}

function replaceContent(images, urls, content) {
  images.forEach(function(image, i) {
    var re = new RegExp(image, 'gi');
    content = content.replace(re, urls[i]);
  });
  return content;
}
