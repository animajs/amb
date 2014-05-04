'use strict';

var debug = require('debug')('amb:html:upload-img');
var gulp = require('gulp');
var path = require('path');
var es = require('event-stream');
var util = require('../util');
var cdn = require('../cdn');
var $ = require('cheerio');

module.exports = uploadImg;

function uploadImg(html, basedir, cb) {
  basedir = basedir || path.join(__dirname, './');
  cb = cb || function() {};

  var images = [];
  $('img', html).each(function() {
    images.push($(this).attr('src'));
  });

  if (images.length) {
    var _images = images.map(function(f) {
      return path.join(basedir, f);
    });
    cdn(_images, function(e, urls) {
      if (e) throw Error(e);
      html = imageHTML(images, urls, html);
      cb(null, html);
    });

  } else {
    return cb(null, html), html;
  }
}

uploadImg.gulp = function() {
  return es.map(function(file, cb) {
    uploadImg(String(file.contents), path.dirname(file.path), function(err, html) {
      file.contents = new Buffer(html);
      cb(null, file);
    });
  });
};


/////////////////
// Helpers.

function imageHTML(images, urls, html) {
  images.forEach(function(image, i) {
    var re = new RegExp('<img[^>]+?'+image+'.*?>', 'i')
    var newImage = util.format('<img src="%s" />', urls[i]);
    html = html.replace(re, newImage);
  });
  return html;
}
