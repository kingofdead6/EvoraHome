/**
 * Bulk-loads the catalogue from a spreadsheet.
 *
 *   npm run products:template            write a starter catalogue.csv
 *   npm run products:import -- <file>    check the file, then import it
 *   npm run products:import -- <file> --dry-run    check only, write nothing
 *
 * Accepts CSV (Excel, LibreOffice, Google Sheets) or JSON.
 *
 * Two things make this safe to hand to the client:
 *
 *   1. Nothing is written unless every row is valid. A file with one bad price
 *      imports zero products rather than 39, so there is never a half-loaded
 *      catalogue to reconcile by hand.
 *   2. Rows are matched on `ref` and upserted. Re-importing a corrected file
 *      updates the same products instead of duplicating them, which means the
 *      normal workflow is: export, edit in Excel, import, repeat.
 *
 * Existing orders are never touched. They carry their own copy of the name and
 * price from the time they were placed.
 */

import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import Product from '../Models/Product.js';
import Category from '../Models/Category.js';
import { parseCsv, toCsv } from '../utils/csv.js';
import {
  COLUMNS,
  TEMPLATE_ROWS,
  normaliseHeader,
  validateBatch,
} from './productRow.js';

dotenv.config();

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const file = args.find((a) => !a.startsWith('--'));

const DRY_RUN = flag('dry-run');
const PRUNE = flag('prune');

const red = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

// ── Template ─────────────────────────────────────────────────────────────────

if (flag('template')) {
  const target = file || 'catalogue.csv';
  if (fs.existsSync(target) && !flag('force')) {
    console.error(
      red(`${target} existe déjà. Utilisez --force pour l'écraser.`),
    );
    process.exit(1);
  }
  fs.writeFileSync(target, toCsv(COLUMNS, TEMPLATE_ROWS));
  console.log(green(`Modèle écrit dans ${target}`));
  console.log(
    dim('Ouvrez-le dans Excel, remplacez les deux exemples par vos produits,'),
  );
  console.log(
    dim(`puis lancez :  npm run products:import -- ${target} --dry-run`),
  );
  process.exit(0);
}

if (!file) {
  console.error(
    red(
      'Usage: npm run products:import -- <fichier.csv> [--dry-run] [--prune]',
    ),
  );
  console.error(dim('   ou: npm run products:template'));
  process.exit(1);
}

if (!fs.existsSync(file)) {
  console.error(red(`Fichier introuvable: ${file}`));
  process.exit(1);
}

// ── Read ─────────────────────────────────────────────────────────────────────

function readRows(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');

  if (path.extname(filePath).toLowerCase() === '.json') {
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : parsed.products;
    if (!Array.isArray(list))
      throw new Error('Le JSON doit être un tableau de produits.');
    return {
      rows: list.map((r, i) => ({ ...r, __line: i + 1 })),
      delimiter: null,
      unknown: [],
    };
  }

  const { rows, headers, delimiter } = parseCsv(raw);

  // Remap headers through the alias table so a renamed column still works, and
  // report the ones we did not recognise rather than silently dropping them.
  const mapping = new Map();
  const unknown = [];
  for (const h of headers) {
    const known = normaliseHeader(h);
    if (known) mapping.set(h, known);
    else if (h) unknown.push(h);
  }

  const remapped = rows.map((row) => {
    const out = { __line: row.__line };
    for (const [from, to] of mapping) out[to] = row[from];
    return out;
  });

  return { rows: remapped, delimiter, unknown };
}

// ── Run ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.MONGO_URI) {
    console.error(red('MONGO_URI manquant.'));
    process.exit(1);
  }

  const { rows, delimiter, unknown } = readRows(file);

  console.log(`\nFichier : ${file}`);
  console.log(
    `Lignes  : ${rows.length}${delimiter ? dim(`   (séparateur '${delimiter}')`) : ''}`,
  );
  if (unknown.length) {
    console.log(yellow(`Colonnes ignorées : ${unknown.join(', ')}`));
  }
  if (!rows.length) {
    console.error(red('\nAucune ligne à importer.'));
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
    console.error(
      red(
        '\nConnexion à la base impossible. Vérifiez MONGO_URI dans server/.env.',
      ),
    );
    process.exit(1);
  }

  const categories = await Category.find().lean();
  if (!categories.length) {
    console.error(
      red("\nAucune catégorie en base. Lancez d'abord `npm run seed`."),
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  // Match on slug and on lowercased name, so the spreadsheet can say either.
  const categoriesBySlug = new Map();
  for (const c of categories) {
    categoriesBySlug.set(c.slug, c);
    categoriesBySlug.set(c.nom.toLowerCase(), c);
  }

  // ── Validate everything before writing anything ────────────────────────────
  const { products, errors, warnings } = validateBatch(rows, categoriesBySlug);

  if (warnings.length) {
    console.log(yellow(`\n${warnings.length} avertissement(s):`));
    for (const w of warnings.slice(0, 30)) console.log(yellow(`  - ${w}`));
    if (warnings.length > 30)
      console.log(yellow(`  ... et ${warnings.length - 30} de plus`));
  }

  if (errors.length) {
    console.log(red(`\n${errors.length} erreur(s). Rien n'a été importé:`));
    for (const e of errors.slice(0, 40)) console.log(red(`  - ${e}`));
    if (errors.length > 40)
      console.log(red(`  ... et ${errors.length - 40} de plus`));
    console.log(dim('\nCorrigez le fichier et relancez.'));
    await mongoose.disconnect();
    process.exit(1);
  }

  // ── Report what would change ───────────────────────────────────────────────
  const existing = await Product.find({
    ref: { $in: products.map((p) => p.ref) },
  })
    .select('ref slug')
    .lean();
  const existingByRef = new Map(existing.map((p) => [p.ref, p]));
  const created = products.filter((p) => !existingByRef.has(p.ref)).length;
  const updated = products.length - created;

  // Renaming a product changes its slug, and the slug is its public URL. The
  // client shares those links on Instagram, so a silent rename quietly breaks
  // them. Say so before writing, not after.
  const renamed = products.filter((p) => {
    const before = existingByRef.get(p.ref);
    return before && before.slug !== p.slug;
  });

  console.log(green(`\n${products.length} produit(s) valide(s)`));
  console.log(`  nouveaux : ${created}`);
  console.log(`  mis à jour : ${updated}`);

  if (renamed.length) {
    console.log(
      yellow(`\n${renamed.length} produit(s) changent d'adresse web (nom modifié).`)
    );
    console.log(yellow('Les liens déjà partagés vers ces pages ne fonctionneront plus :'));
    for (const p of renamed.slice(0, 15)) {
      console.log(yellow(`  - ${p.ref} : /produit/${existingByRef.get(p.ref).slug}  ->  /produit/${p.slug}`));
    }
    if (renamed.length > 15) console.log(yellow(`  ... et ${renamed.length - 15} de plus`));
  }

  let toPrune = [];
  if (PRUNE) {
    toPrune = await Product.find({ ref: { $nin: products.map((p) => p.ref) } })
      .select('ref nom')
      .lean();
    if (toPrune.length) {
      console.log(yellow(`  à supprimer (--prune) : ${toPrune.length}`));
      for (const p of toPrune.slice(0, 20))
        console.log(yellow(`    - ${p.ref}  ${p.nom}`));
      if (toPrune.length > 20)
        console.log(yellow(`    ... et ${toPrune.length - 20} de plus`));
    }
  }

  if (DRY_RUN) {
    console.log(dim("\n--dry-run : rien n'a été écrit."));
    await mongoose.disconnect();
    return;
  }

  // ── Write ──────────────────────────────────────────────────────────────────
  const result = await Product.bulkWrite(
    products.map((p) => ({
      updateOne: {
        filter: { ref: p.ref },
        update: { $set: p },
        upsert: true,
      },
    })),
  );

  if (PRUNE && toPrune.length) {
    await Product.deleteMany({ ref: { $in: toPrune.map((p) => p.ref) } });
  }

  console.log(
    green(
      `\nImporté : ${result.upsertedCount} créé(s), ${result.modifiedCount} modifié(s)` +
        (PRUNE && toPrune.length ? `, ${toPrune.length} supprimé(s)` : ''),
    ),
  );

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(red(`\n${err.message}`));
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
