#!/usr/bin/env node
// driver.mjs — build the Jekyll site and screenshot a study note in light + dark.
//
// Usage (run from the repo root):
//   node .claude/skills/add-study-note/driver.mjs <slug> [--no-build]
//
//   <slug>      the post's permalink slug, i.e. the filename without the
//               YYYY-MM-DD- prefix and .html suffix.
//               e.g. file 2026-06-16-shannon-entropy-visually.html -> slug
//               "shannon-entropy-visually" (permalink is /:title/).
//   --no-build  skip `jekyll build`, just re-screenshot the existing _site.
//
// Output: PNGs written to .claude/skills/add-study-note/screenshots/
//   <slug>-light.png, <slug>-dark.png, index-light.png (the /study-notes/ list)
//
// Why this shape: a study note is a visual web page whose whole point is the
// interactive demos and the cyan/teal theming in BOTH light and dark mode. The
// only way to verify a new note is to render it and look at it. This script does
// exactly that with zero global tooling: it serves the built _site over a local
// http server and drives a headless Chrome (puppeteer-core + the
// chrome-headless-shell that `npx puppeteer browsers install` drops in
// ~/.cache/puppeteer).

import { spawnSync } from "node:child_process";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../../..");
const DOCS = path.join(REPO, "docs");
const SITE = path.join(DOCS, "_site");
const OUT = path.join(__dirname, "screenshots");

const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith("--"));
const noBuild = args.includes("--no-build");
if (!slug) {
  console.error("usage: node driver.mjs <slug> [--no-build]");
  process.exit(2);
}

function findChrome() {
  const base = path.join(process.env.HOME || "/root", ".cache/puppeteer/chrome-headless-shell");
  if (!fs.existsSync(base)) return null;
  for (const ver of fs.readdirSync(base)) {
    const p = path.join(base, ver, "chrome-headless-shell-linux64", "chrome-headless-shell");
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function build() {
  // `bundle exec jekyll` can fail to resolve the binstub under rbenv; invoking
  // the gem's exe through ruby is the reliable path.
  console.log("• building site (bundle exec jekyll build) ...");
  const jekyllExe = spawnSync("bundle", ["show", "jekyll"], { cwd: DOCS, encoding: "utf8" });
  if (jekyllExe.status !== 0) {
    console.error(jekyllExe.stderr || "bundle show jekyll failed");
    process.exit(1);
  }
  const exe = path.join(jekyllExe.stdout.trim(), "exe", "jekyll");
  const r = spawnSync("bundle", ["exec", "ruby", exe, "build"], {
    cwd: DOCS,
    encoding: "utf8",
  });
  process.stdout.write(r.stdout || "");
  if (r.status !== 0) {
    console.error(r.stderr || "jekyll build failed");
    process.exit(1);
  }
  console.log("• build done");
}

const TYPES = {
  ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif",
  ".pdf": "application/pdf", ".ico": "image/x-icon", ".xml": "application/xml",
  ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf",
};

function serve(root) {
  const server = http.createServer((req, res) => {
    let url = decodeURIComponent(req.url.split("?")[0]);
    let fp = path.join(root, url);
    try {
      if (fs.existsSync(fp) && fs.statSync(fp).isDirectory()) fp = path.join(fp, "index.html");
      if (!fs.existsSync(fp)) { res.writeHead(404); res.end("404"); return; }
      res.writeHead(200, { "Content-Type": TYPES[path.extname(fp)] || "application/octet-stream" });
      fs.createReadStream(fp).pipe(res);
    } catch (e) { res.writeHead(500); res.end(String(e)); }
  });
  return new Promise((resolve) => server.listen(0, () => resolve(server)));
}

async function shoot(page, url, file, dark) {
  await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
  await page.evaluate((d) => {
    document.body.classList.toggle("dark-theme", d);
  }, dark);
  // let charts/canvas redraw on the theme change (MutationObserver pattern)
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: file, fullPage: true });
  console.log("  wrote", path.relative(REPO, file));
}

(async () => {
  if (!noBuild) build();
  if (!fs.existsSync(path.join(SITE, slug, "index.html"))) {
    console.error(`✗ _site/${slug}/index.html not found — wrong slug, or the post failed to build.`);
    console.error(`  built posts:`, fs.readdirSync(SITE).filter((d) => fs.existsSync(path.join(SITE, d, "index.html"))).join(", "));
    process.exit(1);
  }
  fs.mkdirSync(OUT, { recursive: true });
  const chrome = findChrome();
  if (!chrome) {
    console.error("✗ chrome-headless-shell not found. Run: npx -y puppeteer browsers install chrome-headless-shell");
    process.exit(1);
  }
  const server = await serve(SITE);
  const port = server.address().port;
  const browser = await puppeteer.launch({
    executablePath: chrome,
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1100, height: 900, deviceScaleFactor: 1 });
    const url = `http://127.0.0.1:${port}/${slug}/`;
    console.log("• screenshotting", url);
    await shoot(page, url, path.join(OUT, `${slug}-light.png`), false);
    await shoot(page, url, path.join(OUT, `${slug}-dark.png`), true);
    await shoot(page, `http://127.0.0.1:${port}/study-notes/`, path.join(OUT, "index-light.png"), false);
  } finally {
    await browser.close();
    server.close();
  }
  console.log("✓ done — screenshots in", path.relative(REPO, OUT) + "/");
})();
