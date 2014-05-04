'use strict';

var gulp = require('gulp');
var es = require('event-stream');
var fs = require('fs');
var path = require('path');
var gulpPeaches = require('../lib/css/peaches');

describe('peaches', function() {

  it('main', function(done) {
    gulp.src('./test/fixtures/peaches/a.css')
      .pipe(gulpPeaches())
      .pipe(es.map(function(file, cb) {
        String(file.contents).should.be.eql(fs.readFileSync(path.join(__dirname, './fixtures/peaches/a-expected.css'), 'utf-8').trim());
        cb(null, file);
      }))
      .on('end', done);
  });
});
