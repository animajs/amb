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

    it('md5 with string', function(done) {
      util.md5(file('./fixtures/md5/a.css'), function(e, results) {
        results.should.be.eql(['d5364e0d4c0174e4a30cea9a03af036d']);
        done();
      });
    });

    it('md5 with array', function(done) {
      util.md5([file('./fixtures/md5/a.css'), file('./fixtures/md5/a.js')], function(e, results) {
        results.should.be.eql(['d5364e0d4c0174e4a30cea9a03af036d', '438d20078f6f20c0480155c5bdaa588e']);
        done();
      });
    });
  });

});
