// ─────────────────────────────────────────────────────────────────────────────
// CATALOG SEED — the single source of demo/catalog data for a store.
//
// The reference design loads ALL product data from the database via the API;
// nothing is hardcoded in the React components. This file is where a store's
// starting catalog lives. Edit the arrays below per store (or replace images
// with real Cloudinary { url, public_id } objects after upload).
//
// Run:  node seed/seed.js          (requires MONGO_URI in the environment / .env)
//
// It uses the existing Mongoose models unchanged.
// ─────────────────────────────────────────────────────────────────────────────

import mongoose from 'mongoose';
import dotenv from 'dotenv';

import User from '../Models/User.js';
import Category from '../Models/Categories.js';
import Product from '../Models/Product.js';

dotenv.config();

const slugify = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

// ── Admin account ────────────────────────────────────────────────────────────
const ADMIN = {
  name: 'Store Admin',
  email: 'admin@example.com',
  password: 'changeme123', // hashed by the User model pre-save hook
  usertype: 'superadmin',
};

// ── Categories ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: 'Electronics', description: 'Gadgets and electronic devices.', image: { url: 'https://via.placeholder.com/800x600?text=Electronics', public_id: null } },
  { name: 'Clothing', description: 'Apparel and fashion.', image: { url: 'https://via.placeholder.com/800x600?text=Clothing', public_id: null } },
  { name: 'Home & Garden', description: 'Everything for your home and garden.', image: { url: 'https://via.placeholder.com/800x600?text=Home+%26+Garden', public_id: null } },
];

// ── Products (category resolved by name below) ───────────────────────────────
const PRODUCTS = [
  {
    name: 'Wireless Headphones',
    categoryName: 'Electronics',
    price: 8900,
    stock: 25,
    featured: true,
    description: 'Example catalog item. Replace with the real catalog per store.',
    images: [{ url: 'https://via.placeholder.com/600x600?text=Headphones', public_id: null }],
  },
  {
    name: 'Smart Watch',
    categoryName: 'Electronics',
    price: 14500,
    stock: 18,
    featured: true,
    description: 'Example catalog item. Replace with the real catalog per store.',
    images: [{ url: 'https://via.placeholder.com/600x600?text=Smart+Watch', public_id: null }],
  },
  {
    name: 'Cotton T-Shirt',
    categoryName: 'Clothing',
    price: 2500,
    stock: 60,
    featured: true,
    description: 'Example catalog item. Replace with the real catalog per store.',
    images: [{ url: 'https://via.placeholder.com/600x600?text=T-Shirt', public_id: null }],
  },
  {
    name: 'Denim Jacket',
    categoryName: 'Clothing',
    price: 6900,
    stock: 30,
    featured: false,
    description: 'Example catalog item. Replace with the real catalog per store.',
    images: [{ url: 'https://via.placeholder.com/600x600?text=Denim+Jacket', public_id: null }],
  },
  {
    name: 'Ceramic Plant Pot',
    categoryName: 'Home & Garden',
    price: 1800,
    stock: 40,
    featured: true,
    description: 'Example catalog item. Replace with the real catalog per store.',
    images: [{ url: 'https://via.placeholder.com/600x600?text=Plant+Pot', public_id: null }],
  },
  {
    name: 'LED Desk Lamp',
    categoryName: 'Home & Garden',
    price: 3400,
    stock: 22,
    featured: false,
    description: 'Example catalog item. Replace with the real catalog per store.',
    images: [{ url: 'https://via.placeholder.com/600x600?text=Desk+Lamp', public_id: null }],
  },
];

async function seed() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not set. Add it to your environment or .env file.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected — seeding…');

  // Admin (upsert by email so re-running is safe)
  if (!(await User.findOne({ email: ADMIN.email }))) {
    await User.create(ADMIN);
    console.log(`Created admin user: ${ADMIN.email}`);
  }

  // Categories
  const catByName = {};
  for (const c of CATEGORIES) {
    const doc = await Category.findOneAndUpdate(
      { name: c.name },
      c,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    catByName[c.name] = doc._id;
  }
  console.log(`Seeded ${CATEGORIES.length} categories.`);

  // Products
  for (const p of PRODUCTS) {
    const { categoryName, ...rest } = p;
    await Product.findOneAndUpdate(
      { name: p.name },
      { ...rest, slug: slugify(p.name), category: catByName[categoryName] },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  console.log(`Seeded ${PRODUCTS.length} products.`);

  await mongoose.disconnect();
  console.log('Done.');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
