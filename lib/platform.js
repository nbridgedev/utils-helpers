'use strict';

const path = require('path');

// Mapping of Node NODE_MODULE_VERSION to napi_build_version. Used to
// select the correct prebuilt binary for the running ABI.
const ABI_MAP = {
  '108': 7, // Node 18
  '115': 7, // Node 20
  '127': 7, // Node 22
  '131': 7  // Node 23
};

const SUPPORTED = [
  'win32-x64',
  'linux-x64',
  'linux-arm64',
  'darwin-x64',
  'darwin-arm64'
];

function checkPlatform() {
  const platform = process.platform;
  const arch = process.arch;
  const abi = process.versions.modules;

  const key = `${platform}-${arch}`;
  const napiBuildVersion = ABI_MAP[abi];
  const supported = SUPPORTED.includes(key) && !!napiBuildVersion;

  const targetPath = path.join(
    __dirname,
    '..',
    'build',
    'Release',
    `utils-helpers-${key}.node`
  );

  return {
    supported,
    platform,
    arch,
    abi,
    key,
    napiBuildVersion,
    targetPath,
    buildDir: path.dirname(targetPath)
  };
}

module.exports = { checkPlatform };
