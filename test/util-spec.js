'use strict';

var util = require('../lib/util');

describe('util', function() {

  // it('upload', function(done) {
  //   util.upload('foo', 'js', function(err, url) {
  //     url.should.be.startWith('https://a.alipayobjects.com/');
  //     done();
  //   });
  // });

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

});
