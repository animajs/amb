'use strict';

var path = require('path');
var util = require('../lib/util');

describe('util', function() {

  // Fake util.cdn
  var _cdn = util.cdn;
  before(function() {
    util.cdn = function(file, callback) {
      callback(null, util.format('http://localhost/%s', path.basename(file)));
    };
  });
  after(function() {
    util.cdn = _cdn;
  });

  it('upload', function(done) {
    util.upload('foo', 'js', function(err, url) {
      url.should.be.startWith('http://localhost/');
      url.should.be.endWith('.js');
      done();
    });
  });

  it('removeExt', function() {
    util.removeExt('/foo/bar.js').should.be.eql('/foo/bar');
  });

  it('getData', function(done) {
    var urls = [
      "http://a.tbcdn.cn/cdnstatus.js",
      "https://s.tbcdn.cn/cdnstatus.js"
    ];
    util.getData(urls, function(err, data) {
      data.should.be.eql('g_prefetch(true, [], 0.1);\n\ng_prefetch(true, [], 0.1);\n')
      done();
    });
  });

  it('groupHTML (css)', function() {
    var html = '' +
      '<link rel="stylesheet" href="http://localhost/a.css" />' +
      '<link rel="stylesheet" href="http://localhost/b.css" />';
    util
      .groupHTML(html, 'http://localhost/c.css', 'css', ['http://localhost/a.css', 'http://localhost/b.css'], 'a')
      .should.be.eql('<link group="a" rel="stylesheet" href="http://localhost/c.css" />');
  });

  it('groupHTML (js)', function() {
    var html = '' +
      '<script src="http://localhost/a.js"></script>' +
      '<script src="http://localhost/b.js"></script>';
    util
      .groupHTML(html, 'http://localhost/c.js', 'js', ['http://localhost/a.js', 'http://localhost/b.js'], 'a')
      .should.be.eql('<script group="a" src="http://localhost/c.js"></script>');
  });

  describe('md5', function() {
    var file = function(filepath) {
      return path.join(__dirname, filepath);
    };

    it('md5 with string', function() {
      util.md5(file('./fixtures/md5/a.css')).should.be.eql(['37ea4bd847c40e41176877f77dfd3fab']);
    });

    it('md5 with array', function() {
      util.md5([file('./fixtures/md5/a.css'), file('./fixtures/md5/a.js')]).should.be.eql(['37ea4bd847c40e41176877f77dfd3fab', '2b60f4a12138abd3fbd063b80af5d5bf']);
    });
  });

});
