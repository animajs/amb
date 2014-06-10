
if (typeof exports == "object") {
  module.exports = require("<%= main %>");
} else if (typeof define == "function" && define.amd) {
  define([], function(){ return require("<%= main %>"); });
} else {
  this["<%= standalone %>"] = require("<%= main %>");
}
