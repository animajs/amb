'use strict';

var spm = require('spm');
var chalk = require('chalk');
var util = require('./util');

var log = module.exports = spm.log;

log.header = function() {
  var args = Array.prototype.slice.call(arguments).slice();
  var msg = util.format.apply(this, args);

  this.info(chalk.magenta(lpad('building', this.width)), '');
};

log.alert = function() {
  var args = Array.prototype.slice.call(arguments).slice();
  var msg = util.format.apply(this, args);

  this.log('info', chalk.green(msg));
};


/////////////////
// Helpers.

function lpad(str, width) {
  while (str.length < width)
    str = ' ' + str;
  return str;
}
