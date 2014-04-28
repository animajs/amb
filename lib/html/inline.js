'use strict';

var gulp = require('gulp');
var path = require('path');
var util = require('util');
var fs = require('fs');
var cheerio = require('cheerio');
var es = require('event-stream');

var REG_LINK_STYLESHEET = /<link.+rel=('|")?stylesheet('|")?.+\/?>/g;
var REG_EXTERNAL_SCRIPT = /<script.+src=.+><\/script>/g;

module.exports = inline;

function inline(data, basedir) {
  basedir = basedir || path.join(__dirname, './');

  // inline css
  data = data.replace(REG_LINK_STYLESHEET, function(text) {
    var el = cheerio('link', text);
    if (el.attr('inline') != undefined && el.attr('href')) {
      var filepath = path.join(basedir, el.attr('href'));
      return util.format('<style>%s</style>', fs.readFileSync(filepath));
    }
    return text;
  });

  // inline js
  data = data.replace(REG_EXTERNAL_SCRIPT, function(text) {
    var el = cheerio('script', text);
    if (el.attr('inline') != undefined && el.attr('src')) {
      var filepath = path.join(basedir, el.attr('src'));
      return util.format('<script>%s</script>', fs.readFileSync(filepath));
    }
    return text;
  });

  return data;
}

inline.gulp = function() {
  return es.map(function(file, cb) {
    file.contents = new Buffer(inline(String(file.contents), path.dirname(file.path)));
    cb(null, file);
  });
};
