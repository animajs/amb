var co = require('co');
var client = require('spm-client');

var methods= [
  'install',
  'info',
  'search'
];

// export client api with co wrap
methods.forEach(function(method) {
  exports[method] = co(client[method]);
});
