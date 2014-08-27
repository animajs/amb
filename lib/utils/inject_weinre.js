var join = require('path').join;
var fs = require('fs');
var getIPAddress = require('ip').address;

var RE_DIR = /\/$/;
var RE_HTML = /\.html?$/;

module.exports = function(root, opts) {

  root = root || process.cwd();
  opts = opts || {port:8989};

  return function inject_middleware(req, res, next) {
    next = next || function() {
      res.writeHead(404);
      res.end('');
    };

    var file = join(root, req.url);

    // support index files
    if (RE_DIR.test(req.url)) {
      if (fs.existsSync(join(file, 'index.html'))) {
        file = join(file, 'index.html');
      }
      else if (fs.existsSync(join(file, 'index.htm'))) {
        file = join(file, 'index.htm');
      }
    }

    if (!RE_HTML.test(file) || !fs.existsSync(file)) {
      return next();
    }

    var ip = getIPAddress();
    var code = '<script src="http://' + ip + ':' + opts.port +
      '/target/target-script-min.js#anonymous"></script>';

    var data = fs.readFileSync(file, 'utf-8');
    data = data + code;

    res.setHeader('Content-Type', 'text/html');
    res.writeHead(200);
    res.end(data);
  }
};


