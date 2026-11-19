#!/usr/bin/env node
// Exits non-zero unless the running Node satisfies docs/package.json "engines.node"
// (a ">=x.y.z" range). Used by the Makefile: npm only warns on engine mismatches,
// and Astro fails in confusing ways on an older Node.
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const min = /^>=\s*(\d+\.\d+\.\d+)$/.exec(pkg.engines?.node ?? '')?.[1];
if (!min) {
  console.error('docs/package.json must set engines.node to ">=x.y.z"');
  process.exit(2);
}

const parse = (v) => v.split('.').map(Number);
const [have, need] = [parse(process.versions.node), parse(min)];
const cmp = have[0] - need[0] || have[1] - need[1] || have[2] - need[2];
if (cmp < 0) {
  console.error(`Node >= ${min} is required, found ${process.versions.node}.`);
  process.exit(1);
}
if (!process.argv.includes('--quiet')) console.log(`Node ${process.versions.node} OK (>= ${min}).`);
