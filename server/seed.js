/**
 * Seeds the Evora Home catalogue.
 *
 *   node seed/seed.js            upsert categories, products, wilayas, settings
 *   node seed/seed.js --reset    wipe those collections first
 *
 * Requires MONGO_URI. Orders and customer accounts are never touched, including
 * under --reset: this script runs against the client's live database after
 * launch to add products, and wiping their orders would be unrecoverable.
 *
 * The admin account is created only if no ADMIN role exists yet. Its password
 * comes from ADMIN_PASSWORD, and the script refuses to invent one, because a
 * default admin password on a live storefront is a way in.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

import Category from './Models/Category.js';
import Product from './Models/Product.js';
import Wilaya from './Models/Wilaya.js';
import User from './Models/User.js';
import Settings, { SINGLETON_ID } from './Models/Settings.js';

import { CATEGORIES, PRODUITS } from './seed/catalogue.js';
import { WILAYAS } from './seed/wilayas.js';
import { PRODUCT_PHOTOS, galleryFor, categoryImage } from './seed/images.js';
import { slugify } from './utils/slugify.js';

dotenv.config();

const RESET = process.argv.includes('--reset');

async function seedCategories() {
  const bySlug = new Map();
  for (const cat of CATEGORIES) {
    const doc = await Category.findOneAndUpdate(
      { slug: cat.slug },
      { $set: { ...cat, image: categoryImage(cat.slug), isActive: true } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    bySlug.set(cat.slug, doc);
  }
  console.log(`  categories: ${bySlug.size}`);
  return bySlug;
}

async function seedProducts(categoriesBySlug) {
  let count = 0;
  for (const p of PRODUITS) {
    const category = categoriesBySlug.get(p.categorie);
    if (!category) {
      throw new Error(`Produit ${p.ref}: catégorie inconnue "${p.categorie}"`);
    }

    const slug = slugify(p.nom);
    const { categorie, nbImages, ...rest } = p;

    await Product.findOneAndUpdate(
      { ref: p.ref },
      {
        $set: {
          ...rest,
          slug,
          categoryId: category._id,
          dimensions: { ...p.dimensions, unite: 'cm' },
          images: galleryFor(PRODUCT_PHOTOS[p.ref], nbImages, p.nom, slug),
          ancienPrix: p.ancienPrix ?? null,
          isFeatured: Boolean(p.isFeatured),
          isNouveau: Boolean(p.isNouveau),
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    count += 1;
  }
  console.log(`  produits: ${count}`);
}

async function seedWilayas() {
  const ops = WILAYAS.map((w) => ({
    updateOne: {
      filter: { code: w.code },
      // Fees are $setOnInsert, not $set: once the client has tuned their real
      // tariff in the admin, re-running the seed must not overwrite it.
      update: {
        $set: { nom: w.nom },
        $setOnInsert: {
          fraisDomicile: w.fraisDomicile,
          fraisStopDesk: w.fraisStopDesk,
          isActive: w.isActive,
        },
      },
      upsert: true,
    },
  }));
  const res = await Wilaya.bulkWrite(ops);
  console.log(`  wilayas: ${WILAYAS.length} (${res.upsertedCount} nouvelles)`);
}

async function syncSeedIndexes() {
  await Promise.all([Category.syncIndexes(), Product.syncIndexes(), Wilaya.syncIndexes()]);
  console.log('  indexes synchronisés');
}

async function seedSettings() {
  await Settings.findByIdAndUpdate(
    SINGLETON_ID,
    {
      $setOnInsert: {
        _id: SINGLETON_ID,
        telephone: '0540870382',
        telephone2: '',
        whatsapp: '213540870382',
        adresse: 'El Khroub 25100, Constantine',
        horaires: 'Samedi au jeudi, 9h00 à 18h00. Vendredi fermé.',
        instagram: 'evorahomealgeria',
        facebook: '',
        tiktok: '',
        heroTitle: "L'élégance prend forme chez vous",
        heroSubtitle:
          'Meuble et article de décoration. Showroom à El Khroub, livraison dans les 58 wilayas.',
      },
    },
    { upsert: true, new: true }
  );
  console.log('  settings: ok');
}

async function seedAdmin() {
  const existing = await User.findOne({ role: 'ADMIN' });
  if (existing) {
    console.log(`  admin: déjà présent (${existing.telephone})`);
    return;
  }

  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 10) {
    console.log(
      '  admin: ignoré. Définir ADMIN_PASSWORD (10 caractères minimum) pour créer le compte admin.'
    );
    return;
  }

  const admin = new User({
    nom: 'Evora Home',
    telephone: process.env.ADMIN_PHONE || '0540870382',
    email: process.env.ADMIN_EMAIL?.trim().toLowerCase() || '',
    role: 'ADMIN',
    passwordHash: password,
  });
  await admin.save();
  console.log(`  admin: créé (${admin.telephone})`);
}

async function main() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI manquant.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connecté');

  if (RESET) {
    // Deliberately excludes Order, User and Counter.
    await Promise.all([Category.deleteMany({}), Product.deleteMany({}), Wilaya.deleteMany({})]);
    console.log('Catalogue et wilayas vidés (commandes et comptes conservés)');
  }

  await syncSeedIndexes();

  console.log('Seed:');
  const categories = await seedCategories();
  await seedProducts(categories);
  await seedWilayas();
  await seedSettings();
  await seedAdmin();

  await mongoose.disconnect();
  console.log('Terminé');
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
