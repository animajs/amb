var should = require('should');
var fs = require('fs');
var join = require('path').join;
var glob = require('glob');
var gulp = require('gulp');
var clean = require('gulp-clean');
var build = require('../lib/build');

describe('build', function() {

  var base = join(__dirname, 'fixtures/build');
  var dest = join(base, 'dist');

  afterEach(function(done) {
    gulp.reset();
    gulp.removeAllListeners();
    gulp.src(dest)
      .pipe(clean({force: true}))
      .on('end', done)
      .resume();
  });

  it('normal', function(done) {
    var opt = {
      cwd: join(base, 'normal'),
      dest: dest
    };
    build(opt, function(err) {
      assets('normal', dest);
      done();
    });
  });

  it('standalone', function(done) {
    var opt = {
      cwd: join(base, 'normal'),
      dest: dest,
      include: 'standalone'
    };
    build(opt, function(err) {
      assets('standalone', dest);
      done();
    });
  });

  it('umd', function(done) {
    var opt = {
      cwd: join(base, 'normal'),
      dest: dest,
      include: 'umd'
    };
    build(opt, function(err) {
      assets('umd', dest);
      done();
    });
  });

  it('umd with camelcase', function(done) {
    var opt = {
      cwd: join(base, 'umd-camelcase'),
      dest: dest,
      include: 'umd'
    };
    build(opt, function(err) {
      assets('umd-camelcase', dest);
      done();
    });
  });

  it('precompile', function(done) {
    var opt = {
      cwd: join(base, 'precompile'),
      dest: dest,
      coffeeOpts: {bare:true}
    };
    build(opt, function(err) {
      assets('precompile', dest);
      fs.unlinkSync(join(opt.cwd, 'a.css'));
      fs.unlinkSync(join(opt.cwd, 'a.js'));
      done();
    });
  });

  it('ambfile', function(done) {
    var opt = {
      cwd: join(base, 'ambfile'),
      dest: dest
    };
    build(opt, function(err) {
      assets('ambfile', dest);
      done();
    });
  });

  it('should clean directory', function(done) {
    var fakeFile = join(dest, 'a.js');
    fs.mkdirSync(dest);
    fs.writeFileSync(fakeFile);

    var opt = {
      cwd: join(base, 'normal'),
      dest: dest,
      force: true
    };
    build(opt, function(err) {
      fs.existsSync(fakeFile).should.be.false;
      done();
    });
  });

  it('no-output', function(done) {
    var opt = {
      cwd: join(base, 'no-output'),
      dest: dest
    };
    build(opt, function(err) {
      var distFiles = glob.sync('**/*', {cwd: dest});
      distFiles.length.should.be.equal(0);
      err.should.be.truthy;
      done();
    });
  });

  it('copy image', function(done) {
    var opt = {
      cwd: join(base, 'copy-img'),
      dest: dest
    };
    build(opt, function(err) {
      fs.existsSync(join(dest, 'a/0.1.0/a.gif')).should.be.true;
      done();
    });
  });

  function assets(prefix, dest) {
    var expect = join(base, 'expect', prefix);
    var expectFiles = glob.sync('**/*', {cwd: expect});
    var distFiles = glob.sync('**/*', {cwd: dest});

    expectFiles.length.should.eql(distFiles.length);
    expectFiles.filter(function(file) {
      return fs.statSync(join(expect, file)).isFile();
    })
      .forEach(function(file) {
        var expected = fs.readFileSync(join(expect, file))
          .toString().replace(/\n$/, '');
        var actual = fs.readFileSync(join(dest, file)).toString();
        actual.should.eql(expected);
      });
  }
});