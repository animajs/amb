var extend = require('extend');
var request = require('request');
var http = require('http');
var join = require('path').join;
var injectWeinre = require('../lib/utils/inject_weinre');

var port = 12345;
var server;
var root = join(__dirname, 'fixtures/inject_weinre');

describe('inject weinre', function() {

  describe('normal', function() {
    before(function(done) {
      server = http.createServer(injectWeinre(root, {port: 8989}));
      server.listen(port, done);
    });
    after(function() {
      server && server.close();
    });

    it('dir with index.htm', function(done) {
      local('', function(err, res, body) {
        body.should.be.equal('<html></html><script src="http://localhost:8989/target/target-script-min.js#anonymous"></script>');
        done();
      });
    });

    it('dir with index.html', function(done) {
      local('html/', function(err, res, body) {
        body.should.be.equal('<html></html><script src="http://localhost:8989/target/target-script-min.js#anonymous"></script>');
        done();
      });
    });

    it('index.htm', function(done) {
      local('index.htm', function(err, res, body) {
        body.should.be.equal('<html></html><script src="http://localhost:8989/target/target-script-min.js#anonymous"></script>');
        done();
      });
    });

    it('not exist dir', function(done) {
      local('abc/', function(err, res, body) {
        res.statusCode.should.be.equal(404);
        done();
      });
    });

    it('exits but not htm or html file', function(done) {
      local('index.js', function(err, res, body) {
        res.statusCode.should.be.equal(404);
        done();
      });
    });
  });

  describe('no root and opts', function() {
    before(function(done) {
      process.chdir(root);
      server = http.createServer(injectWeinre());
      server.listen(port, done);
    });
    after(function() {
      server && server.close();
    });

    it('normal', function(done) {
      local('', function(err, res, body) {
        body.should.be.equal('<html></html><script src="http://localhost:8989/target/target-script-min.js#anonymous"></script>');
        done();
      });
    });
  });
});

function local(pathname, cb, opts) {
  var args = {
    url: 'http://localhost:'+port+'/'+pathname
  };
  request(extend(args, opts), cb);
}
