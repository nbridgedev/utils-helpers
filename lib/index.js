'use strict';

const js = require('./js');

// Attempt to load the native binding. This is optional — the package
// works without it. See README for details on the JS fallback.
let native = null;
try {
  native = require('../build/Release/utils-helpers');
} catch (_) {
  // Native binding not present for this platform. Fall through to JS.
}

// deepMerge dispatches to the native path when available.
function deepMerge(target, source) {
  if (native && typeof native.deepMerge === 'function') {
    return native.deepMerge(target, source);
  }
  return js.deepMerge(target, source);
}

// debounce and memoize are JS-only — no native acceleration provided.
const { debounce, memoize } = js;

module.exports = { deepMerge, debounce, memoize };
