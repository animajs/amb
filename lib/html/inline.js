'use strict';

var debug = require('debug')('amb:html:inline');
var gulp = require('gulp');
var path = require('path');
var util = require('util');
var fs = require('fs');
var cheerio = require('cheerio');
var es = require('event-stream');
var EventProxy = require('eventproxy');
var request = require('request');
var chalk = require('chalk');

module.exports = inline;

var REG_LINK_STYLESHEET = /<link.+rel=('|")?stylesheet('|")?.+\/?>/gi;
var REG_EXTERNAL_SCRIPT = /<script.+src=.+><\/script>/gi;

/**
 * Inline css and js for html.
 * @param  {String}   html
 * @param  {String}   basedir
 * @param  {Function} cb
 * @return {String}
 */
function inline(html, basedir, cb) {
  basedir = basedir || path.join(__dirname, './');
  cb = cb || function() {};
  var remotes = [];

  function getContent(url, tagname) {
    var isRemote = /^https?:\/\//.test(url);
    var content;
    if (isRemote) {
      content = addNoise(url);
      remotes.push(content);
    } else {
      var filepath = path.join(basedir, url);
      content = fs.readFileSync(filepath);
    }
    return content;
  }

  function addNoise(url) {
    return '__' + url + '__';
  }

  function removeNoise(url) {
    return url.replace(/__/g, '');
  }

  // inline css
  html = html.replace(REG_LINK_STYLESHEET, function(text) {
    var el = cheerio('link', text);
    if (el.attr('inline') != undefined && el.attr('href')) {
      var content = getContent(el.attr('href'));
      return util.format('<style>%s</style>', content);
    }
    return text;
  });

  // inline js
  html = html.replace(REG_EXTERNAL_SCRIPT, function(text) {
    var el = cheerio('script', text);
    if (el.attr('inline') != undefined && el.attr('src')) {
      var content = getContent(el.attr('src'));
      return util.format('<script>%s</script>', content);
    }
    return text;
  });

  // replace remote assets
  if (remotes.length) {
    var ep = new EventProxy();
    ep.after('fetch', remotes.length, function() {
      cb(null, html);
    });
    remotes.forEach(function(url) {
      request(removeNoise(url), function(err, res, body) {
        if (err || res.statusCode != 200) {
          console.error('remote fetch error: [%s] %s', res.statusCode, chalk.red(err));
        } else {
          html = html.replace(url, body);
        }
        ep.emit('fetch');
      });
    });

  } else {
    return cb(null, html), html;
  }
}

/**
 * Gulp version of inline.
 */
inline.gulp = function() {
  return es.map(function(file, cb) {
    inline(String(file.contents), path.dirname(file.path), function(err, data) {
      file.contents = new Buffer(data);
      cb(null, file);
    });
  });
};
