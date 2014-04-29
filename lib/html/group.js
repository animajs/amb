'use strict';

var debug = require('debug')('amb:html:group');
var gulp = require('gulp');
var path = require('path');
var util = require('../util');
var fs = require('fs');
var $ = require('cheerio');
var es = require('event-stream');
var EventProxy = require('eventproxy');
var request = require('request');
var chalk = require('chalk');
var cdn = require('cdn');
var async = require('async');

module.exports = group;

function group(html, cb) {
  cb = cb || function() {};

  var groups = {
    css: {},
    js : {}
  };

  // get css and js groups
  addGroup('link[rel=stylesheet][group]', 'css', 'href');
  addGroup('script[group]', 'js', 'src');

  groups = normalize(groups);

  // do group
  if (groups && groups.length) {
    var ep = new EventProxy();
    ep.after('group', groups.length, function() {
      cb(null, html);
    });

    groups.forEach(function(group) {
      // Group steps:
      // 1. concat remote assets
      // 2. upload to cdn
      // 3. replace html
      async.waterfall([
        function(next) {
          debug('get data: %s', group.urls.join(','));
          util.getData(group.urls, next);
        },
        function(data, next) {
          util.upload(data, group.type, next);
        },
        function(url, next) {
          debug('replace url: %s', url);
          html = util.groupHTML(html, url, group.type, group.urls);
          ep.emit('group');
        }
      ]);
    });

  } else {
    return cb(null, html), html;
  }

  ////////////////////////
  // Helpers

  function addGroup(selector, type, assetAttr) {
    var els = $(selector, html);
    els.each(function(index) {
      var group = $(this).attr('group');
      if (!groups[type][group]) {
        groups[type][group] = [];
      }
      groups[type][group].push($(this).attr(assetAttr));
    });
  }

  function normalize(groups) {
    var ret = [];
    for (var type in groups) {
      var groupsInType = groups[type];
      for (var name in groupsInType) {
        var urls = groupsInType[name];
        // don't group group that has only 1 css or js
        if (urls.length >= 2) {
          ret.push({type:type,name:name,urls:urls});
        }
      }
    }
    return ret;
  }
}

group.gulp = function() {
  return es.map(function(file, cb) {
    cb(null, file);
  });
};
