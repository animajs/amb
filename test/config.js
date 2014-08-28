var config = require('../lib/config');
var join = require('path').join;

describe('config', function() {

  it('normal', function() {
    var cwd = join(__dirname, 'fixtures/config');
    var args = config.get(cwd);

    // custom
    args.registry.should.be.equal('1');
    // default
    args.dest.should.be.equal('./dist/');
  });
});
