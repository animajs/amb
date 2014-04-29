/**
 * Sea.js 2.3.0 | seajs.org/LICENSE.md
 */
(function(global, undefined) {

// Avoid conflicting when `sea.js` is loaded multiple times
if (global.define) {
  return
}


var data = {}


/**
 * util-lang.js - The minimal language enhancement
 */

function isType(type) {
  return function(obj) {
    return {}.toString.call(obj) == "[object " + type + "]"
  }
}

var isArray = Array.isArray || isType("Array")
var isFunction = isType("Function")

var _cid = 0
function cid() {
  return _cid++
}



/**
 * util-path.js - The utilities for operating path such as id, uri
 */

var DIRNAME_RE = /[^?#]*\//

// Extract the directory portion of a path
// dirname("a/b/c.js?t=123#xx/zz") ==> "a/b/"
// ref: http://jsperf.com/regex-vs-split/2
function dirname(path) {
  return path.match(DIRNAME_RE)[0]
}

var cwd = dirname(location.href)


/**
 * module.js - The core of module loader
 */

var cachedMods = {}

function Module(uri, deps) {
  this.uri = uri
  this.dependencies = deps || []
}

// Execute a module
Module.prototype.exec = function () {
  var mod = this

  // When module is executed, DO NOT execute it again. When module
  // is being executed, just return `module.exports` too, for avoiding
  // circularly calling
  if (mod.exports !== undefined) {
    return mod.exports
  }

  // Create require
  var uri = mod.uri

  function require(id) {
    return Module.get(id).exec()
  }

  require.resolve = function(id) {
    return id
  }

  require.async = function(ids, callback) {
    Module.use(ids, callback, uri + "_async_" + cid())
    return require
  }

  // Exec factory
  var factory = mod.factory

  var exports = isFunction(factory) ?
      factory(require, mod.exports = {}, mod) :
      factory

  if (exports === undefined) {
    exports = mod.exports
  }

  // Reduce memory leak
  delete mod.factory

  mod.exports = exports

  return exports
}

// Define a module
Module.define = function (id, deps, factory) {
  var argsLen = arguments.length

  // define(factory)
  if (argsLen === 1) {
    factory = id
    id = undefined
  }
  else if (argsLen === 2) {
    factory = deps

    // define(deps, factory)
    if (isArray(id)) {
      deps = id
      id = undefined
    }
    // define(id, factory)
    else {
      deps = undefined
    }
  }

  id = id || ''
  var meta = {
    id: id,
    uri: id,
    deps: deps,
    factory: factory
  }

  Module.save(meta.uri, meta)
}

// Save meta data to cachedMods
Module.save = function(uri, meta) {
  var mod = Module.get(uri)

  mod.id = meta.id || uri
  mod.dependencies = meta.deps || []
  mod.factory = meta.factory
}

// Get an existed module or create a new one
Module.get = function(uri, deps) {
  return cachedMods[uri] || (cachedMods[uri] = new Module(uri, deps))
}

// Use function is equal to load a anonymous module
Module.use = function (ids, callback, uri) {
  var mod = Module.get(uri, isArray(ids) ? ids : [ids])

  var exports = []
  var uris = mod.dependencies

  for (var i = 0, len = uris.length; i < len; i++) {
    exports[i] = cachedMods[uris[i]].exec()
  }

  if (callback) {
    callback.apply(global, exports)
  }

}


// Public API

global.define = Module.define

global.define.use = function(ids, callback) {
  Module.use(ids, callback, cwd + "_use_" + cid())
  return global.define
}


/**
 * config.js - The configuration for the loader
 */

// The current working directory
global.define.cwd = cwd
global.define.cache = cachedMods
})(this);
