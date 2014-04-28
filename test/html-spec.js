'use strict';

var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var es = require('event-stream');
var html = require('../lib/html');

describe('html', function() {

  describe('inline', function() {
    var inline = html.inline;

    it('do not inline by default', function() {
      var data = '<link rel="stylesheet" href="a.css" /><script src="b.js"></script>';
      inline(data).should.be.eql(data);
    });

    it('inline css and js with `inline` attribute', function() {
      var exceptData = '<style>'+fs.readFileSync(path.join(__dirname, './fixtures/a.css'))+'</style>';
      inline('<link inline rel="stylesheet" href="fixtures/a.css" />', __dirname).should.be.eql(exceptData);
      inline('<link inline rel=\'stylesheet\' href=\'fixtures/a.css\' />', __dirname).should.be.eql(exceptData);
      inline('<link inline rel=stylesheet href=fixtures/a.css />', __dirname).should.be.eql(exceptData);
      inline('<link inline href=fixtures/a.css rel=stylesheet />', __dirname).should.be.eql(exceptData);
      inline('<link href=fixtures/a.css inline rel=stylesheet />', __dirname).should.be.eql(exceptData);
      inline('<link href=fixtures/a.css rel=stylesheet inline />', __dirname).should.be.eql(exceptData);
      inline('<link href=fixtures/a.css rel=stylesheet inline >', __dirname).should.be.eql(exceptData);
      inline('<link href=fixtures/a.css rel=stylesheet inline>', __dirname).should.be.eql(exceptData);

      var exceptData = '<script>'+fs.readFileSync(path.join(__dirname, './fixtures/a.js'))+'</script>';
      inline('<script inline src="fixtures/a.js"></script>', __dirname).should.be.eql(exceptData);
      inline('<script inline src=\'fixtures/a.js\'></script>', __dirname).should.be.eql(exceptData);
      inline('<script inline src=fixtures/a.js></script>', __dirname).should.be.eql(exceptData);
      inline('<script src=fixtures/a.js inline></script>', __dirname).should.be.eql(exceptData);
      inline('<script src=fixtures/a.js inline charset=utf-8></script>', __dirname).should.be.eql(exceptData);
    });

    it('inline with remote assets', function(done) {
      inline('<script src=http://a.tbcdn.cn/cdnstatus.js inline></script>', __dirname, function(err, data) {
        data.should.be.eql('<script>g_prefetch(true, [], 0.1);\n</script>');
        done();
      });
    });

    it('inline with gulp', function(done) {
      gulp.src('test/fixtures/a.html')
        .pipe(inline.gulp())
        .pipe(es.map(function(file, cb) {
          String(file.contents).should.be.eql(fs.readFileSync(path.join(__dirname, './fixtures/a-expected.html'), 'utf-8'));
          cb(null, file);
        }))
        .on('end', done);
    });

  });

});
