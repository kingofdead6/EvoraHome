/**
 * Dumps the catalogue to CSV, in exactly the shape the importer reads.
 *
 *   npm run products:export                 writes catalogue-export.csv
 *   npm run products:export -- mon.csv      writes to a chosen file
 *
 * This is the other half of the workflow. Export, edit in Excel, import: a
 * price rise across 40 products is a column drag rather than 40 trips through
 * the admin form.
 */

import fs from 'node:fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import Product from '../Models/Product.js';
import { toCsv } from '../utils/csv.js';
import { COLUMNS } from './productRow.js';

dotenv.config();

const args = process.argv.slice(2);
const target = args.find((a) => !a.startsWith('--')) || 'catalogue-export.csv';

async function main() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI manquant.');
    process.exit(1);
  }

  // Ten seconds rather than Mongoose's default thirty. A wrong connection
  // string is the most likely failure here and the client should be told
  // quickly, with a message they can act on.
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
  } catch {
    console.error('\nConnexion à la base impossible. Vérifiez MONGO_URI dans server/.env.');
    process.exit(1);
  }

  const products = await Product.find()
    .populate('categoryId', 'nom')
    .sort({ ref: 1 })
    .lean();

  const rows = products.map((p) => ({
    ref: p.ref,
    nom: p.nom,
    categorie: p.categoryId?.nom || '',
    prix: p.prix,
    ancienPrix: p.ancienPrix ?? '',
    description: p.description || '',
    largeur: p.dimensions?.largeur ?? '',
    profondeur: p.dimensions?.profondeur ?? '',
    hauteur: p.dimensions?.hauteur ?? '',
    materiaux: (p.materiaux || []).join(' | '),
    couleurs: (p.couleurs || []).map((c) => `${c.nom}:${c.hex}`).join(' | '),
    images: [...(p.images || [])]
      .sort((a, b) => a.ordre - b.ordre)
      .map((i) => i.url)
      .join(' | '),
    // Left blank on export: `images` above is authoritative, and filling both
    // would make a re-import ambiguous.
    nbImages: '',
    disponibilite: p.disponibilite,
    delaiLivraison: p.delaiLivraison || '',
    isFeatured: p.isFeatured ? 'oui' : 'non',
    isNouveau: p.isNouveau ? 'oui' : 'non',
  }));

  fs.writeFileSync(target, toCsv(COLUMNS, rows));

  console.log(
    `\x1b[32m${rows.length} produit(s) exporté(s) dans ${target}\x1b[0m`,
  );
  console.log(
    `\x1b[2mModifiez-le dans Excel, puis :  npm run products:import -- ${target} --dry-run\x1b[0m`,
  );

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(`\x1b[31m${err.message}\x1b[0m`);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
