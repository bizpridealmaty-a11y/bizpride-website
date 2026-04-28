// IndexNow ping — runs after `astro build` (see package.json).
// Reads dist/sitemap-0.xml, picks the most recently modified URLs,
// and POSTs them to api.indexnow.org so Yandex + Bing pick up new
// content in minutes instead of waiting 1-2 weeks for natural recrawl.
//
// IndexNow protocol: https://www.indexnow.org/documentation
// Yandex docs: https://yandex.com/support/webmaster/indexing-options/indexnow.html

import { readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SITEMAP = path.join(ROOT, 'dist', 'sitemap-0.xml');
const HOST = 'bizpride.kz';
const KEY = 'b17b8717d34281cb8086b69ebcab75a2';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const API_ENDPOINT = 'https://api.indexnow.org/indexnow';
const MAX_URLS = 50; // hard ceiling — IndexNow allows up to 10000 but we don't need to spam
const SKIP_IF_NO_CI = true; // only ping during Netlify CI build, not local dev

// Skip on local builds — only run during Netlify deploy.
if (SKIP_IF_NO_CI && !process.env.NETLIFY) {
  console.log('[indexnow] Skipping — not in Netlify CI environment');
  process.exit(0);
}

if (!existsSync(SITEMAP)) {
  console.log(`[indexnow] Skipping — sitemap not found at ${SITEMAP}`);
  process.exit(0);
}

const xml = await readFile(SITEMAP, 'utf8');
const allUrls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);

if (allUrls.length === 0) {
  console.log('[indexnow] Skipping — no URLs found in sitemap');
  process.exit(0);
}

// IndexNow strongly prefers FRESH content. Take a slice of MAX_URLS
// from the start of sitemap (Astro emits root pages first, then alpha-
// sorted blog posts) — covers homepage, all category hubs, and most
// recently added blog content.
const urls = allUrls.slice(0, MAX_URLS);

const body = {
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: urls,
};

console.log(`[indexnow] Submitting ${urls.length} URLs to ${API_ENDPOINT}`);

try {
  const res = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });

  // IndexNow status codes:
  //   200 OK              — accepted, will crawl
  //   202 Accepted        — accepted, validation pending
  //   400 Bad request     — malformed payload
  //   403 Forbidden       — key file mismatch (publicly hosted key ≠ submitted key)
  //   422 Unprocessable   — URLs don't belong to declared host
  //   429 Too Many Reqs   — throttled (try later)
  if (res.ok || res.status === 202) {
    console.log(`[indexnow] OK (HTTP ${res.status}) — Yandex + Bing will pick up changes shortly`);
  } else {
    const text = await res.text();
    console.warn(`[indexnow] WARN (HTTP ${res.status}): ${text.slice(0, 300)}`);
    // Non-fatal — don't fail the deploy if IndexNow rejects us.
  }
} catch (err) {
  console.warn(`[indexnow] WARN — network error: ${err.message}`);
  // Non-fatal.
}
