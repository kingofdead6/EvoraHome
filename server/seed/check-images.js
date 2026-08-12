/**
 * Verifies every image URL in the seed catalogue actually resolves.
 *
 *   node seed/check-images.js
 *
 * Exits non-zero if any image is missing, so it can gate a demo or a deploy.
 * Run it before seeding: a 404 here becomes an empty greige frame on the
 * storefront, which is the exact failure this catalogue was written to fix.
 *
 * It hits the network and nothing else — no database connection, no writes.
 */

import { CATEGORIES, PRODUITS } from './catalogue-images.js';

const TIMEOUT_MS = 20000;

/** Every URL in the seed, tagged with where it came from for the report. */
function collectUrls() {
  const urls = [];

  for (const cat of CATEGORIES) {
    if (cat.image) urls.push({ url: cat.image, source: `catégorie ${cat.slug}` });
  }

  for (const p of PRODUITS) {
    p.images.forEach((url, i) => {
      urls.push({ url, source: `${p.ref} image ${i + 1}` });
    });
  }

  return urls;
}

/**
 * HEAD first because it avoids downloading the body. Some CDNs answer HEAD with
 * 405 while serving GET perfectly well, so a non-2xx HEAD is retried as a GET
 * before being called a failure.
 */
async function check({ url, source }) {
  const attempt = async (method) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, { method, redirect: 'follow', signal: controller.signal });
      return res.status;
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    let status = await attempt('HEAD');
    if (status < 200 || status >= 300) status = await attempt('GET');
    return { url, source, status, ok: status >= 200 && status < 300 };
  } catch (err) {
    return { url, source, status: err.name === 'AbortError' ? 'timeout' : 'erreur', ok: false };
  }
}

async function main() {
  const urls = collectUrls();
  const unique = [...new Map(urls.map((u) => [u.url, u])).values()];

  console.log(`Vérification de ${unique.length} images uniques (${urls.length} références)...\n`);

  // Batched so a large catalogue does not open 80 sockets at once.
  const results = [];
  const BATCH = 8;
  for (let i = 0; i < unique.length; i += BATCH) {
    results.push(...(await Promise.all(unique.slice(i, i + BATCH).map(check))));
  }

  const failed = results.filter((r) => !r.ok);

  for (const r of results.filter((r) => r.ok)) {
    console.log(`  ok    ${r.source}`);
  }

  if (failed.length) {
    console.error(`\n${failed.length} image(s) indisponible(s) :`);
    for (const r of failed) {
      console.error(`  ${r.status}  ${r.source}`);
      console.error(`        ${r.url}`);
    }
    process.exit(1);
  }

  console.log(`\nToutes les images répondent (${unique.length}/${unique.length}).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
