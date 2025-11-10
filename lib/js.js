'use strict';

// Pure-JS implementations. Used when the native binding is unavailable
// (unsupported platform, missing prebuild, or failed install).

function deepMerge(target, source) {
  if (source === null || typeof source !== 'object') return target;
  for (const key of Object.keys(source)) {
    const sv = source[key];
    const tv = target[key];
    if (Array.isArray(sv)) {
      target[key] = sv.slice();
    } else if (sv && typeof sv === 'object') {
      target[key] = deepMerge(
        (tv && typeof tv === 'object' && !Array.isArray(tv)) ? tv : {},
        sv
      );
    } else {
      target[key] = sv;
    }
  }
  return target;
}

function debounce(fn, wait) {
  let timer = null;
  return function debounced(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn.apply(this, args);
    }, wait);
  };
}

function memoize(fn, keyFn) {
  const cache = new Map();
  const deriveKey = keyFn || ((...args) => JSON.stringify(args));
  return function memoized(...args) {
    const k = deriveKey(...args);
    if (cache.has(k)) return cache.get(k);
    const v = fn.apply(this, args);
    cache.set(k, v);
    return v;
  };
}

module.exports = { deepMerge, debounce, memoize };
