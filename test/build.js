'use strict';

var should = require('should');
var sinon = require('sinon');
var fs = require('fs');
var join = require('path').join;
var glob = require('glob');
var gulp = require('gulp');
var clean = require('gulp-clean');
var build = require('../lib/build');
var log = require('spm-log');

describe('build', function() {

  var base = join(__dirname, 'fixtures');
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

  it('spmfile', function(done) {
    var opt = {
      cwd: join(base, 'spmfile'),
      dest: dest
    };
    build(opt, function(err) {
      assets('spmfile', dest);
      fs.readFileSync(join(base, 'spmfile/start'), 'utf-8').should.be.equal('start');
      fs.readFileSync(join(base, 'spmfile/end'), 'utf-8').should.be.equal('end');
      fs.unlinkSync(join(base, 'spmfile/start'));
      fs.unlinkSync(join(base, 'spmfile/end'));
      done();
    });
  });

  it('pathmap', function(done) {
    var opt = {
      cwd: join(base, 'normal'),
      dest: dest,
      pathmap: '%{a/0.1.0/,}p'
    };
    build(opt, function(err) {
      assets('pathmap', dest);
      done();
    });
  });

  it('pathmap with template', function(done) {
    var opt = {
      cwd: join(base, 'normal'),
      dest: dest,
      pathmap: '%{{{name}}/{{version}}/,}p'
    };
    build(opt, function(err) {
      assets('pathmap', dest);
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

  it('autoprefixer', function(done) {
    var opt = {
      cwd: join(base, 'autoprefixer'),
      dest: dest
    };
    build(opt, function(err) {
      assets('autoprefixer', dest);
      done();
    });
  });

  it('onlinecheck: deps-not-publish-warn', function(done) {
    var opt = {
      cwd: join(base, 'deps-not-publish-warn'),
      dest: dest
    };
    var warn = sinon.spy(log, 'warn');
    build(opt, function(err) {
      warn.callCount.should.be.equal(1);
      warn.restore();
      done();
    });
  });

  it('onlinecheck: already-published', function(done) {
    var opt = {
      cwd: join(base, 'already-published'),
      dest: dest
    };
    build(opt, function(err) {
      err.should.not.be.equal(null);
      err.message.should.be.equal('This version alipay-xbox@1.2.0 is already published!');
      done();
    });
  });

  it('install import-style if required', function(done) {
    var opt = {
      cwd: join(base, 'extdeps'),
      dest: dest
    };
    build(opt, function(err) {
      should.not.exist(err);
      assets('extdeps', dest);
      // resume package.json for next test
      fs.writeFileSync(
        join(opt.cwd, 'package.json'),
        '{"name":"a","version":"0.1.0","spm":{}}\n',
        'utf-8'
      );
      done();
    });
  });

  it('with deps', function(done) {
    var opt = {
      cwd: join(base, 'normal'),
      dest: dest,
      withDeps: true
    };
    build(opt, function(err) {
      assets('with-deps', dest);
      done();
    });
  });

  it('with deps and ignore', function(done) {
    var opt = {
      cwd: join(base, 'normal'),
      dest: dest,
      withDeps: true,
      ignore: ['type']
    };
    build(opt, function(err) {
      assets('with-deps-and-ignore', dest);
      done();
    });
  });

  it('duplicate', function(done) {
    var opt = {
      cwd: join(base, 'duplicate'),
      dest: dest
    };
    var warn = sinon.spy(log, 'warn');
    build(opt, function(err) {
      assets('duplicate', dest);
      // 1 duplicate + 1 checkonline
      warn.callCount.should.be.equal(2);
      warn.restore();
      done();
    });
  });

  it('install', function(done) {
    var opt = {
      cwd: join(base, 'normal'),
      dest: dest,
      install: true
    };
    var info = sinon.spy(log, 'info');
    build(opt, function(err) {
      info.calledWith('install').should.be.true;
      info.restore();
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
