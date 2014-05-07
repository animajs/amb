'use strict';

var spm = require('spm');
var chalk = require('chalk');
var util = require('./util');

var log = module.exports = spm.log;

log.header = function() {
  var args = Array.prototype.slice.call(arguments).slice();
  var msg = util.format.apply(this, args);

  this.log('info', chalk.bold.white(msg));
};

log.alert = function() {
  var args = Array.prototype.slice.call(arguments).slice();
  var msg = util.format.apply(this, args);

  this.log('info', chalk.bold.green(msg));
};
