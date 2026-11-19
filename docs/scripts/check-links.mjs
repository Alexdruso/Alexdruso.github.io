#!/usr/bin/env node
// Dependency-free internal link and image checker for the built site
// (replaces html-proofer). Usage: node scripts/check-links.mjs [dist]
//
// For every built HTML page it checks that each internal href/src points to a
// file that exists in the build, and that #fragment links point to an id on
// the target page. External links (http:, https:, mailto:, ...) are skipped.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? 'dist');
if (!fs.existsSync(root)) {
  console.error(`✗ ${root} does not exist — run \`npm run build\` first.`);
  process.exit(2);
}

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)],
  );
const pages = walk(root).filter((f) => f.endsWith('.html'));

// Drop scripts, styles and comments so URLs inside JS strings aren't checked.
const markup = (html) => html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/g, '');

const idCache = new Map();
function ids(file) {
  if (!idCache.has(file)) {
    const html = markup(fs.readFileSync(file, 'utf8'));
    idCache.set(file, new Set([...html.matchAll(/\s(?:id|name)=["']([^"']+)["']/g)].map((m) => m[1])));
  }
  return idCache.get(file);
}

/** Map a site URL path to the built file that serves it, or null. */
function resolve(urlPath) {
  const p = path.join(root, decodeURIComponent(urlPath));
  if (urlPath.endsWith('/')) return fs.existsSync(path.join(p, 'index.html')) ? path.join(p, 'index.html') : null;
  if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  if (fs.existsSync(path.join(p, 'index.html'))) return path.join(p, 'index.html');
  return null;
}

let checked = 0;
const failures = [];
for (const page of pages) {
  const html = markup(fs.readFileSync(page, 'utf8'));
  const pageUrl = '/' + path.relative(root, page).split(path.sep).join('/').replace(/index\.html$/, '');
  for (const m of html.matchAll(/\s(href|src)=["']([^"']*)["']/g)) {
    const raw = m[2].trim();
    if (!raw || /^[a-z][a-z0-9+.-]*:/i.test(raw) || raw.startsWith('//')) continue;
    checked++;
    const url = new URL(raw, 'http://site' + pageUrl);
    const target = url.pathname === pageUrl && raw.startsWith('#') ? page : resolve(url.pathname);
    const where = `${path.relative(root, page)}: ${m[1]}="${raw}"`;
    if (!target) {
      failures.push(`${where} → missing ${url.pathname}`);
    } else if (url.hash && url.hash !== '#' && target.endsWith('.html') && !ids(target).has(decodeURIComponent(url.hash.slice(1)))) {
      failures.push(`${where} → no element with id "${url.hash.slice(1)}"`);
    }
  }
}

if (failures.length) {
  console.error(`✗ ${failures.length} broken internal link(s):\n  ` + failures.join('\n  '));
  process.exit(1);
}
console.log(`✓ ${checked} internal links/images across ${pages.length} pages all resolve.`);
