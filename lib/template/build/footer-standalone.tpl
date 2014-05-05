
if (typeof exports == "object") {
  module.exports = define.require("<%= main %>");
} else if (typeof define == "function" && define.amd) {
  define([], function(){ return define.require("<%= main %>"); });
} else {
  this["<%= standalone %>"] = define.require("<%= main %>");
}
