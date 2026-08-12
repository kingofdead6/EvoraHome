/**
 * Wipes the catalogue and rebuilds it from `catalogue-images.js`.
 *
 *   node seed/reseed-catalogue.js            verify images, then wipe and reseed
 *   node seed/reseed-catalogue.js --skip-check   reseed without the network check
 *   node seed/reseed-catalogue.js --yes          skip the confirmation prompt
 *
 * WHAT IT DELETES
 * Every Category and every Product. That is the point: the old catalogue
 * pointed at image files that were never added, so a partial upsert would leave
 * the broken records in place alongside the new ones.
 *
 * WHAT IT NEVER TOUCHES
 * Orders, users, wilayas and settings. Deleting a client's order history is
 * unrecoverable, so this script has no code path that can do it — the two
 * collections it clears are named explicitly rather than looped over.
 *
 * Products hold a categoryId, so categories are recreated first and products
 * are mapped onto the new ids. Running this against a live database invalidates
 * any product URL the client has shared, because slugs are rebuilt from names.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import readline from 'node:readline/promises';

import Category from '../Models/Category.js';
import Product from '../Models/Product.js';

import { CATEGORIES, PRODUITS } from './catalogue-images.js';
import { slugify } from '../utils/slugify.js';

dotenv.config();

const SKIP_CHECK = process.argv.includes('--skip-check');
const ASSUME_YES = process.argv.includes('--yes');

/**
 * Confirms every image resolves before deleting anything.
 *
 * The order matters: verifying after the wipe would mean a network blip leaves
 * the client with no catalogue at all. Checking first means the worst case is
 * that nothing happens.
 */
async function verifyImages() {
  const urls = [
    ...CATEGORIES.filter((c) => c.image).map((c) => c.image),
    ...PRODUITS.flatMap((p) => p.images),
  ];
  const unique = [...new Set(urls)];

  process.stdout.write(`Vérification de ${unique.length} images... `);

  const results = await Promise.all(
    unique.map(async (url) => {
      try {
        const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
        return res.ok ? null : `${res.status} ${url}`;
      } catch {
        return `injoignable ${url}`;
      }
    })
  );

  const failed = results.filter(Boolean);
  if (failed.length) {
    console.log('échec');
    console.error(`\n${failed.length} image(s) indisponible(s) :`);
    failed.forEach((f) => console.error(`  ${f}`));
    console.error('\nRien n’a été supprimé. Corrigez les URLs et relancez.');
    process.exit(1);
  }

  console.log('ok');
}

async function confirm(productCount, categoryCount) {
  if (ASSUME_YES) return true;
  if (!process.stdin.isTTY) return true;

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(
    `\nSupprimer ${productCount} produit(s) et ${categoryCount} catégorie(s) existants ? (oui/non) `
  );
  rl.close();
  return ['oui', 'o', 'yes', 'y'].includes(answer.trim().toLowerCase());
}

async function main() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI manquant. Renseignez-le dans server/.env');
    process.exit(1);
  }

  if (!SKIP_CHECK) await verifyImages();

  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connecté');

  const [existingProducts, existingCategories] = await Promise.all([
    Product.countDocuments(),
    Category.countDocuments(),
  ]);

  if (!(await confirm(existingProducts, existingCategories))) {
    console.log('Annulé. Rien n’a été supprimé.');
    await mongoose.disconnect();
    return;
  }

  // Only these two collections. Orders and users are never in scope.
  const [deletedProducts, deletedCategories] = await Promise.all([
    Product.deleteMany({}),
    Category.deleteMany({}),
  ]);
  console.log(
    `Supprimés : ${deletedProducts.deletedCount} produits, ${deletedCategories.deletedCount} catégories`
  );

  const categoriesBySlug = new Map();
  for (const cat of CATEGORIES) {
    const doc = await Category.create({ ...cat, isActive: true });
    categoriesBySlug.set(cat.slug, doc);
  }
  console.log(`Catégories : ${categoriesBySlug.size}`);

  let created = 0;
  for (const p of PRODUITS) {
    const category = categoriesBySlug.get(p.categorie);
    if (!category) throw new Error(`Produit ${p.ref} : catégorie inconnue "${p.categorie}"`);

    const slug = slugify(p.nom);
    const { categorie, images, ...rest } = p;

    await Product.create({
      ...rest,
      slug,
      categoryId: category._id,
      dimensions: { ...p.dimensions, unite: 'cm' },
      images: images.map((url, i) => ({
        url,
        alt: i === 0 ? p.nom : `${p.nom}, vue ${i + 1}`,
        ordre: i,
      })),
      ancienPrix: p.ancienPrix ?? null,
      isFeatured: Boolean(p.isFeatured),
      isNouveau: Boolean(p.isNouveau),
    });
    created += 1;
  }
  console.log(`Produits : ${created}`);

  // The unique indexes on ref and slug only exist once synced, and a fresh
  // collection after deleteMany can be missing them.
  await Promise.all([Category.syncIndexes(), Product.syncIndexes()]);
  console.log('Index synchronisés');

  const featured = await Product.countDocuments({ isFeatured: true });
  console.log(`\nTerminé. ${created} produits, dont ${featured} en vedette sur l’accueil.`);

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
