;(function() {
var ajs_x_010_a_debug;
ajs_x_010_a_debug = function () {
  alert(1);
}();

if (typeof exports == "object") {
  module.exports = ajs_x_010_a_debug;
} else if (typeof define == "function" && define.amd) {
  define([], function(){ return ajs_x_010_a_debug });
} else {
  this["aJsX"] = ajs_x_010_a_debug;
}
}());
