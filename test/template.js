var template = require('../lib/utils/template');

describe('iduri', function() {
  it('normal', function() {
    template('').should.be.equal('');
    template('{{a}}', {a:'b'}).should.be.equal('b');
    template('{{b}}', {a:'b'}).should.be.equal('');
  });
});
