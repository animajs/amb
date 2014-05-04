'use strict';

var path = require('path');
var fs = require('fs');
var gulp = require('gulp');
var es = require('event-stream');
var relativeHTMLImg = require('../lib/html').relativeHTMLImg;
var util = require('../lib/util');

describe('relativeHTMLImg', function() {

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
    relativeHTMLImg('<div></div>').should.be.eql('<div></div>');
  });

  it('upload with images', function(done) {
    relativeHTMLImg(fs.readFileSync(path.join(__dirname, './fixtures/relative-html-img/a.html'), 'utf-8'), path.join(__dirname, './fixtures/relative-html-img/'), function(e, html) {
      html.should.be.eql(fs.readFileSync(path.join(__dirname, './fixtures/relative-html-img/a-expected.html'), 'utf-8'));
      done();
    });
  });

  it('upload images with gulp', function(done) {
    gulp.src('test/fixtures/relative-html-img/a.html')
      .pipe(relativeHTMLImg.gulp())
      .pipe(es.map(function(file, cb) {
        String(file.contents).should.be.eql(fs.readFileSync(path.join(__dirname, './fixtures/relative-html-img/a-expected.html'), 'utf-8'));
        cb(null, file);
      }))
      .on('end', done);
  });
});
