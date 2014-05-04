'use strict';

var spm3Anima = require('spm3-anima');

var spm = module.exports = {};

spm.install = function(options) {
  options = options || {query:[]};
  spm3Anima.install(options);
};
