'use strict';

var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var es = require('event-stream');
var $ = require('cheerio');
var html = require('../lib/html');
var util = require('../lib/util');

describe('group', function() {
  var group = html.group;

  // Fake util.upload
  var _upload = util.upload;
  before(function() {
    util.upload = function(a, b, next) {
      next(null, '__url__');
    };
  });
  after(function() {
    util.upload = _upload;
  });

  after(function() {});

  it('do not group by default', function() {
    var data = '<link rel="stylesheet" href="a.css" /><script src="b.js"></script>';
    group(data).should.be.eql(data);
  });

  it('do not group that only has 1 css or js', function() {
    var data = '<link rel="stylesheet" href="http://g.tbcdn.cn/tb/global/2.7.1/global-min.css" /><script src="b.js"></script>';
    group(data).should.be.eql(data);
  });

  it('group css', function(done) {
    var html = '<link rel="stylesheet" href="http://a.tbcdn.cn/cdnstatus.js" group="a">'
      +'<link rel="stylesheet" href="https://s.tbcdn.cn/cdnstatus.js" group="a">';
    group(html, function(err, data) {
      data.should.be.eql('<link group="a" rel="stylesheet" href="__url__" />');
      done();
    });
  });

  it('group js', function(done) {
    var html = '<script src="http://a.tbcdn.cn/cdnstatus.js" group="a"></script>'
      +'<script src="https://s.tbcdn.cn/cdnstatus.js" group="a"></script>';
    group(html, function(err, data) {
      data.should.be.eql('<script group="a" src="__url__"></script>');
      done();
    });
  });

  it('group with gulp', function(done) {
    gulp.src('test/fixtures/group/a.html')
      .pipe(group.gulp())
      .pipe(es.map(function(file, cb) {
        var html = String(file.contents);
        $('link', html).length.should.be.eql(2);
        $('script', html).length.should.be.eql(2);
        cb(null, file);
      }))
      .on('end', done);
  });

});
