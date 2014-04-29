'use strict';

var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var es = require('event-stream');
var html = require('../lib/html');
var util = require('../lib/util');

describe('group', function() {
  var group = html.group;

  it('do not group by default', function() {
    var data = '<link rel="stylesheet" href="a.css" /><script src="b.js"></script>';
    group(data).should.be.eql(data);
  });

  it('do not group that only has 1 css or js', function() {
    var data = '<link rel="stylesheet" href="http://g.tbcdn.cn/tb/global/2.7.1/global-min.css" /><script src="b.js"></script>';
    group(data).should.be.eql(data);
  });

  // Fake util.upload
  util.upload = function(a, b, next) {
    next(null, 'http://a.alipayobjects.com/a.js');
  };

  it('group css', function(done) {
    var html = '<link rel="stylesheet" href="http://a.tbcdn.cn/cdnstatus.js" group="a">'
      +'<link rel="stylesheet" href="https://s.tbcdn.cn/cdnstatus.js" group="a">';
    group(html, function(err, data) {
      data.should.be.containEql('a.alipayobjects.com');
      done();
    });
  });

  it('group js', function(done) {
    var html = '<script src="http://a.tbcdn.cn/cdnstatus.js" group="a"></script>'
      +'<script src="https://s.tbcdn.cn/cdnstatus.js" group="a"></script>';
    group(html, function(err, data) {
      data.should.be.containEql('a.alipayobjects.com');
      done();
    });
  });

});
