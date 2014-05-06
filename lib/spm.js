'use strict';

var spm = require('spm');

module.exports = {

  install: function(options) {
    options = options || {query:[]};
    spm.install(options);
  }
};
