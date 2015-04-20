var join = require('path').join;

var DEFAULT_CONFIG = {
  // spm 源
  "registry": "http://spmjs.io",

  // Rename files
  // 详见：https://github.com/jeremyruppel/pathmap
  "pathmap": null,

  // JS 压缩配置项
  // 详见：https://github.com/terinjokes/gulp-uglify/
  "uglifyOpts": {
    "output": {
      "ascii_only": true
    }
  },

  // CSS 压缩配置项
  // 详见：https://github.com/GoalSmashers/clean-css
  "cssminOpts": {
    "noAdvanced": true
  },

  // less 编译配置项
  // 详见：https://github.com/plus3network/gulp-less
  "lessOpts": null,

  // coffee 预编译配置项
  // 详见：https://github.com/wearefractal/gulp-coffee
  "coffeeOpts": {
    "bare": true
  },

  // autoprefixer 配置项, 默认关闭
  // https://github.com/sindresorhus/gulp-autoprefixer
  "autoprefixer": false
};


//////////////////////
// Exports.

exports.get = function(cwd) {
  cwd = cwd || process.cwd();

  var userConfig = require(join(cwd, 'package.json')).spm;
  return extendExist(DEFAULT_CONFIG, userConfig);
};


/////////////////////
// Helpers.

function extendExist(source, obj) {
  var ret = {};
  for (var k in source) {
    ret[k] = source[k];
    if (typeof obj[k] === 'object' && typeof source[k] === 'object') {
      for (var kk in obj[k]) {
        ret[k][kk] = obj[k][kk];
      }
    } else if(typeof obj[k] !== 'undefined') {
      ret[k] = obj[k];
    }
  }
  return ret;
}
