'use strict';

// Post-install build step. Attempts to fetch a prebuilt native binding
// for the current platform. If no prebuilt is available, defers to the
// runtime JavaScript implementation in lib/js.js.

const fs = require('fs');
const { checkPlatform } = require('../lib/platform');
const { installPrebuild } = require('../lib/prebuild');

async function main() {
  const check = checkPlatform();
  if (!check.supported) return;

  if (fs.existsSync(check.targetPath)) return;

  try {
    await installPrebuild(check);
  } catch (err) {
    // prebuild-install behavior: any failure is silent. The runtime
    // falls back to the pure-JS implementation transparently.
  }
}

main().finally(() => process.exit(0));
