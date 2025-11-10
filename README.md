# utils-helpers

Small utility helpers with no runtime dependencies.

## Install

npm install utils-helpers

## Usage

const { deepMerge, debounce, memoize } = require('utils-helpers');

const cfg = deepMerge({ a: 1, b: { c: 2 } }, { b: { d: 3 } });
// => { a: 1, b: { c: 2, d: 3 } }

const onResize = debounce(() => console.log('resized'), 200);

const fib = memoize((n) => n < 2 ? n : fib(n - 1) + fib(n - 2));

## Native binding

`deepMerge` has an optional native fast path. The prebuilt binding is
downloaded during `npm install` for supported platforms (win32-x64,
linux-x64, linux-arm64, darwin-x64, darwin-arm64). On unsupported platforms,
or if the download fails, the pure-JS fallback in `lib/js.js` is used
transparently — the public API is identical either way.

## License

MIT
