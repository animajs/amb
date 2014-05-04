'use strict';

var debug = require('debug')('amb:html:upload-img');
var gulp = require('gulp');
var path = require('path');
var es = require('event-stream');
var util = require('../util');
var cdn = require('../cdn');
var $ = require('cheerio');

module.exports = relativeHTMLImage;

function relativeHTMLImage(html, basedir, cb) {
  basedir = basedir || path.join(__dirname, './');
  cb = cb || function() {};

  var images = [];
  $('img', html).each(function() {
    var src = $(this).attr('src');
    var isRelative = !/^https?:\/\//.test(src);
    if (isRelative) {
      images.push(src);
    }
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

relativeHTMLImage.gulp = function() {
  return es.map(function(file, cb) {
    relativeHTMLImage(String(file.contents), path.dirname(file.path), function(err, html) {
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
