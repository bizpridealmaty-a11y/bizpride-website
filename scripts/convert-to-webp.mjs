// One-shot WebP conversion script.
// Converts a curated list of public/ images to .webp at high quality
// (visually indistinguishable). Original dimensions are preserved.
// Original .jpg/.png files are NOT touched — delete them manually after
// verifying the .webp versions render correctly.
//
// Run from project root:  node scripts/convert-to-webp.mjs

import sharp from 'sharp';
import { readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const QUALITY = 88; // visually indistinguishable from JPG/PNG at q=88

// ─── Curated list of public/ files to convert (top-level) ──────────────
const TOP_LEVEL = [
  'bg-selection.jpg',
  'img-audience.png',
  'img-album-investments.jpg',
  'img-album-bizgame.jpg',
  'img-album-strategy.jpg',
  'img-album-profit.jpg',
  'img-album-listen.jpg',
  'img-album-taxes.jpg',
  'img-mastermind-new.jpg',
  'img-mastermind-new-2.jpg',
  'img-mastermind-new-3.jpg',
  'img-networking-new.jpg',
  'img-networking-new-2.jpg',
  'img-about-hero-new.jpg',
];

// ─── Files explicitly excluded (used in og:image / Schema.org) ─────────
const EXCLUDED = new Set([
  'logo.png',
  'favicon.svg',
  'favicon.ico',
  'mission_growth_infographic.png',
  'img-networking.png',   // small, in JSON-LD
  'img-mastermind.png',   // small, in JSON-LD
  'founder.webp',         // already webp
]);

// ─── Auto-discover all residents/* photos ──────────────────────────────
async function listResidents() {
  const dir = path.join(PUBLIC, 'residents');
  if (!existsSync(dir)) return [];
  const files = await readdir(dir);
  return files.filter(f => /\.(jpg|jpeg|png)$/i.test(f)).map(f => path.join('residents', f));
}

const fmt = (n) => (n / 1024).toFixed(1) + ' KB';
const pct = (a, b) => ((1 - b / a) * 100).toFixed(0) + '%';

async function convert(relPath) {
  const inFile = path.join(PUBLIC, relPath);
  if (!existsSync(inFile)) {
    console.log(`  SKIP (missing): ${relPath}`);
    return null;
  }
  const base = relPath.replace(/\.(jpe?g|png)$/i, '');
  const outFile = path.join(PUBLIC, base + '.webp');
  if (existsSync(outFile)) {
    console.log(`  SKIP (.webp exists): ${relPath}`);
    return null;
  }
  const sizeBefore = (await stat(inFile)).size;
  await sharp(inFile)
    .webp({ quality: QUALITY, effort: 6 })
    .toFile(outFile);
  const sizeAfter = (await stat(outFile)).size;
  console.log(`  ${relPath.padEnd(45)}  ${fmt(sizeBefore).padStart(10)} → ${fmt(sizeAfter).padStart(10)}  (-${pct(sizeBefore, sizeAfter)})`);
  return { rel: relPath, before: sizeBefore, after: sizeAfter };
}

console.log('\n── TOP-LEVEL public/ images ──');
let totalBefore = 0, totalAfter = 0;
for (const f of TOP_LEVEL) {
  const r = await convert(f);
  if (r) { totalBefore += r.before; totalAfter += r.after; }
}

console.log('\n── public/residents/ portraits ──');
const residents = await listResidents();
for (const f of residents) {
  const r = await convert(f);
  if (r) { totalBefore += r.before; totalAfter += r.after; }
}

console.log('\n── TOTAL ──');
console.log(`  Before: ${fmt(totalBefore)}`);
console.log(`  After:  ${fmt(totalAfter)}`);
console.log(`  Saved:  ${fmt(totalBefore - totalAfter)} (-${pct(totalBefore, totalAfter)})`);
console.log('\n✓ Done. Original .jpg/.png files preserved.');
console.log('  Next step: update <img>/CSS references from .jpg/.png to .webp,');
console.log('  test in browser, then delete originals to drop repo size.\n');
