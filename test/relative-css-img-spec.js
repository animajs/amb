'use strict';

var path = require('path');
var fs = require('fs');
var gulp = require('gulp');
var es = require('event-stream');
var relativeCSSImg = require('../lib/css/relative-css-img');
var util = require('../lib/util');

describe('relativeCSSImg', function() {

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
    relativeCSSImg('a{background:red;}').should.be.eql('a{background:red;}');
  });

  it('upload with images', function(done) {
    relativeCSSImg(fs.readFileSync(path.join(__dirname, './fixtures/relative-css-img/a.css'), 'utf-8'), path.join(__dirname, './fixtures/relative-css-img/'), function(e, html) {
      html.should.be.eql(fs.readFileSync(path.join(__dirname, './fixtures/relative-css-img/a-expected.css'), 'utf-8'));
      done();
    });
  });

  it('upload images with gulp', function(done) {
    gulp.src('test/fixtures/relative-css-img/a.css')
      .pipe(relativeCSSImg.gulp())
      .pipe(es.map(function(file, cb) {
        String(file.contents).should.be.eql(fs.readFileSync(path.join(__dirname, './fixtures/relative-css-img/a-expected.css'), 'utf-8'));
        cb(null, file);
      }))
      .on('end', done);
  });
});
