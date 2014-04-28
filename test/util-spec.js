'use strict';

var util = require('../lib/util');

describe('util', function() {

  it('upload', function(done) {
    util.upload('foo', 'js', function(err, url) {
      url.should.be.startWith('https://a.alipayobjects.com/');
      done();
    });
  });

  it('removeExt', function() {
    util.removeExt('/foo/bar.js').should.be.eql('/foo/bar');
  });

});
