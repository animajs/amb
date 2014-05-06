'use strict';

var debug = require('debug')('amb:html:htmlimg');
var gulp = require('gulp');
var path = require('path');
var es = require('event-stream');
var util = require('../util');
var cdn = require('../cdn');
var $ = require('cheerio');

module.exports = main;

function main(content, basedir, cb) {
  basedir = basedir || path.join(__dirname, './');
  cb = cb || function() {};

  var images = getImages(content, basedir);

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

function getImages(content, basedir) {
  var images = [];
  $('img', content).each(function() {
    var src = $(this).attr('src');
    var isRelative = !/^https?:\/\//.test(src);
    if (isRelative) {
      images.push(src);
    }
  });
  return images;
}
 
function replaceContent(images, urls, content) {
  images.forEach(function(image, i) {
    var re = new RegExp('<img[^>]+?'+image+'.*?>', 'i')
    var newImage = util.format('<img src="%s" />', urls[i]);
    content = content.replace(re, newImage);
  });
  return content;
}