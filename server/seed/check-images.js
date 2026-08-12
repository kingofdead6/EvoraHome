/**
 * Confirms that every photograph the seed would write actually resolves.
 *
 *   node seed/check-images.js        (npm run check:images)
 *
 * The seed's photography lives on a CDN, so a wrong or withdrawn photo id is
 * not a crash: it is a product that quietly renders an empty frame on the
 * storefront. This sends a HEAD request for every URL and prints the ones that
 * do not come back 200, with the key to fix in `seed/images.js`.
 *
 * Run it after editing `seed/images.js`, and once before a launch. It needs
 * network access and nothing else - no database, no environment variables.
 */

import { PRODUCT_PHOTOS, CATEGORY_PHOTOS, photoUrl, wideUrl } from './images.js';

const CONCURRENCY = 8;
const TIMEOUT_MS = 15000;

async function head(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: controller.signal });
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, status: err.name === 'AbortError' ? 'timeout' : err.message };
  } finally {
    clearTimeout(timer);
  }
}

/** A small worker pool. Firing 47 requests at once gets us rate limited. */
async function mapPool(items, worker) {
  const results = [];
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
      while (cursor < items.length) {
        const index = cursor;
        cursor += 1;
        results[index] = await worker(items[index]);
      }
    })
  );
  return results;
}

const targets = [
  ...Object.entries(PRODUCT_PHOTOS).map(([ref, id]) => ({
    label: `produit ${ref}`,
    key: `PRODUCT_PHOTOS['${ref}']`,
    url: photoUrl(id),
  })),
  ...Object.entries(CATEGORY_PHOTOS).map(([slug, id]) => ({
    label: `catégorie ${slug}`,
    key: `CATEGORY_PHOTOS['${slug}']`,
    url: wideUrl(id),
  })),
];

console.log(`Vérification de ${targets.length} photographies...\n`);

const checked = await mapPool(targets, async (target) => ({ ...target, ...(await head(target.url)) }));
const broken = checked.filter((c) => !c.ok);

for (const item of checked) {
  console.log(`  ${item.ok ? 'ok  ' : 'FAIL'}  ${item.label}${item.ok ? '' : ` (${item.status})`}`);
}

if (broken.length) {
  console.error(`\n${broken.length} photographie(s) introuvable(s). À remplacer dans seed/images.js :`);
  for (const item of broken) console.error(`  ${item.key}\n    ${item.url}`);
  console.error(
    '\nRemplacez la valeur par l\'identifiant d\'une autre photo Unsplash : ouvrez la photo,\n' +
      'copiez la fin de son URL d\'image (photo-XXXXXXXXXXXXX-XXXXXXXXXXXX), puis relancez.\n'
  );
  process.exit(1);
}

console.log('\nToutes les photographies répondent.\n');
