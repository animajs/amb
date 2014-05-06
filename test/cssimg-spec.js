'use strict';

var path = require('path');
var fs = require('fs');
var gulp = require('gulp');
var es = require('event-stream');
var cssimg = require('../lib/css/cssimg');
var util = require('../lib/util');

describe('cssimg', function() {

  // Fake util.cdn
  var _cdn = util.cdn;
  before(function() {
    util.cdn = function(files, callback) {
      callback(null, files.map(function(f) {
        return util.format('http://localhost/%s', path.basename(f));
      }));
    };
  });
  after(function() {
    util.cdn = _cdn;
  });

  it('do not upload if no img', function() {
    cssimg('a{background:red;}').should.be.eql('a{background:red;}');
  });

  it('upload with images', function(done) {
    cssimg(fs.readFileSync(path.join(__dirname, './fixtures/cssimg/a.css'), 'utf-8'), path.join(__dirname, './fixtures/cssimg/'), function(e, html) {
      html.should.be.eql(fs.readFileSync(path.join(__dirname, './fixtures/cssimg/a-expected.css'), 'utf-8'));
      done();
    });
  });

  it('upload images with gulp', function(done) {
    gulp.src('test/fixtures/cssimg/a.css')
      .pipe(cssimg.gulp())
      .pipe(es.map(function(file, cb) {
        String(file.contents).should.be.eql(fs.readFileSync(path.join(__dirname, './fixtures/cssimg/a-expected.css'), 'utf-8'));
        cb(null, file);
      }))
      .on('end', done);
  });
});
