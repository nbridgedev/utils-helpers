'use strict';

// Public API. If the native binding was installed, lib/index.js wires it
// in as a fast path for deepMerge. Otherwise the pure-JS implementations
// in lib/js.js are used transparently.

module.exports = require('./lib');
