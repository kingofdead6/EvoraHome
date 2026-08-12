/**
 * Tests the CSV parser and the row mapping without a database.
 *
 *   npm run products:verify
 *
 * These are the two places an import can quietly go wrong: a delimiter or a
 * quoted field misread, or a French spreadsheet value mapped to the wrong
 * type. Both are pure functions, so both can be tested here even though no
 * MongoDB is reachable from this environment.
 */

import mongoose from 'mongoose';

import { parseCsv, toCsv, detectDelimiter } from '../utils/csv.js';
import { COLUMNS, TEMPLATE_ROWS, mapRow, normaliseHeader, validateBatch } from './productRow.js';

let failures = 0;
const fail = (msg) => {
  failures += 1;
  console.error(`  FAIL  ${msg}`);
};
const ok = (msg) => console.log(`  ok    ${msg}`);
const eq = (label, got, want) => {
  const g = JSON.stringify(got);
  const w = JSON.stringify(want);
  if (g === w) ok(label);
  else fail(`${label}: ${g} au lieu de ${w}`);
};

// Stand-in for what the importer loads from the database. Real ObjectIds,
// because validateBatch runs the documents through the Mongoose validators and
// a string id would (correctly) be rejected as an uncastable reference.
const SALONS = new mongoose.Types.ObjectId();
const TABLES = new mongoose.Types.ObjectId();

const categories = new Map([
  ['salons', { _id: SALONS, nom: 'Salons', slug: 'salons' }],
  ['tables-et-chaises', { _id: TABLES, nom: 'Tables & Chaises', slug: 'tables-et-chaises' }],
  ['tables & chaises', { _id: TABLES, nom: 'Tables & Chaises', slug: 'tables-et-chaises' }],
]);

console.log('\nCSV: séparateurs');
eq('virgule', detectDelimiter('a,b,c'), ',');
eq('point-virgule (Excel FR)', detectDelimiter('a;b;c'), ';');
eq('tabulation', detectDelimiter('a\tb\tc'), '\t');
eq(
  'séparateur entre guillemets ignoré',
  detectDelimiter('"Canapé, grand";prix;ref'),
  ';'
);

console.log('\nCSV: analyse');
{
  const { rows } = parseCsv('ref;nom\nLA CONNER;Canapé');
  eq('ligne simple', rows[0].nom, 'Canapé');
}
{
  const { rows } = parseCsv('ref;nom\nX;"Canapé, grand modèle"');
  eq('séparateur dans un champ cité', rows[0].nom, 'Canapé, grand modèle');
}
{
  const { rows } = parseCsv('ref;nom\nX;"Canapé ""La Conner"""');
  eq('guillemets doublés', rows[0].nom, 'Canapé "La Conner"');
}
{
  const { rows } = parseCsv('ref;description\nX;"Ligne 1\nLigne 2"');
  eq('retour à la ligne dans un champ cité', rows[0].description, 'Ligne 1\nLigne 2');
}
{
  const { rows } = parseCsv('﻿ref;nom\nX;Test');
  eq('BOM retiré', rows[0].ref, 'X');
}
{
  const { rows } = parseCsv('ref;nom\r\nX;Test\r\n\r\n');
  eq('CRLF et lignes vides', rows.length, 1);
}
{
  const { rows } = parseCsv('ref;nom\nX;Test');
  eq('numéro de ligne signalé', rows[0].__line, 2);
}

console.log('\nCSV: écriture puis relecture');
{
  const tricky = [
    { ref: 'A', nom: 'Canapé; "grand"', description: 'Ligne 1\nLigne 2' },
  ];
  const csv = toCsv(['ref', 'nom', 'description'], tricky);
  const { rows } = parseCsv(csv);
  eq('aller-retour sans perte', rows[0].nom, 'Canapé; "grand"');
  eq('aller-retour multi-lignes', rows[0].description, 'Ligne 1\nLigne 2');
  if (!csv.startsWith('﻿')) fail('BOM absent du fichier écrit');
  else ok('BOM présent pour Excel');
}

console.log('\nEn-têtes');
eq('nom exact', normaliseHeader('ref'), 'ref');
eq('accent', normaliseHeader('Référence'), 'ref');
eq('casse', normaliseHeader('PRIX'), 'prix');
eq('synonyme', normaliseHeader('coloris'), 'couleurs');
eq('synonyme français', normaliseHeader('vedette'), 'isFeatured');
eq('inconnu', normaliseHeader('couleur préférée du gérant'), null);

console.log('\nLignes valides');
{
  const { product, errors } = mapRow(
    {
      __line: 2,
      ref: 'la conner',
      nom: "Canapé d'angle La Conner",
      categorie: 'Salons',
      prix: '289 000,00 DA',
      ancienPrix: '320000',
      largeur: '310',
      profondeur: '190',
      hauteur: '85',
      materiaux: 'Tissu bouclé | Bois massif',
      couleurs: 'Beige sable:#D8CDB8 | Gris perle:B9B7B0',
      nbImages: '3',
      disponibilite: 'en stock',
      delaiLivraison: '5 à 8 jours',
      isFeatured: 'oui',
      isNouveau: 'non',
    },
    categories
  );

  eq('aucune erreur', errors, []);
  eq('référence en majuscules', product.ref, 'LA CONNER');
  eq('prix format français', product.prix, 289000);
  eq('ancien prix conservé', product.ancienPrix, 320000);
  eq('catégorie par nom', String(product.categoryId), String(SALONS));
  eq('slug généré', product.slug, 'canape-d-angle-la-conner');
  eq('dimensions', product.dimensions, { largeur: 310, profondeur: 190, hauteur: 85, unite: 'cm' });
  eq('matériaux', product.materiaux, ['Tissu bouclé', 'Bois massif']);
  eq('couleurs, dièse ajouté', product.couleurs, [
    { nom: 'Beige sable', hex: '#D8CDB8' },
    { nom: 'Gris perle', hex: '#B9B7B0' },
  ]);
  eq('images générées par convention', product.images.map((i) => i.url), [
    '/products/canape-d-angle-la-conner-01.jpg',
    '/products/canape-d-angle-la-conner-02.jpg',
    '/products/canape-d-angle-la-conner-03.jpg',
  ]);
  eq('disponibilité', product.disponibilite, 'EN_STOCK');
  eq('booléen oui', product.isFeatured, true);
  eq('booléen non', product.isNouveau, false);
}

console.log('\nVariantes tolérées');
{
  const base = {
    __line: 2, ref: 'X', nom: 'Test', categorie: 'salons', prix: '1000',
    largeur: '10', hauteur: '10',
  };
  eq(
    'catégorie par slug',
    String(mapRow({ ...base, categorie: 'tables-et-chaises' }, categories).product.categoryId),
    String(TABLES)
  );
  eq(
    'disponibilité "sur commande"',
    mapRow({ ...base, disponibilite: 'Sur Commande' }, categories).product.disponibilite,
    'SUR_COMMANDE'
  );
  eq(
    'disponibilité "rupture"',
    mapRow({ ...base, disponibilite: 'RUPTURE' }, categories).product.disponibilite,
    'RUPTURE'
  );
  eq(
    'disponibilité vide vaut en stock',
    mapRow({ ...base, disponibilite: '' }, categories).product.disponibilite,
    'EN_STOCK'
  );
  eq(
    'images explicites, préfixe ajouté',
    mapRow({ ...base, images: 'photo-a.jpg | /products/photo-b.jpg' }, categories).product.images.map((i) => i.url),
    ['/products/photo-a.jpg', '/products/photo-b.jpg']
  );
  eq(
    'booléen "x"',
    mapRow({ ...base, isFeatured: 'x' }, categories).product.isFeatured,
    true
  );
  eq(
    'matériaux séparés par virgule',
    mapRow({ ...base, materiaux: 'Bois, Métal' }, categories).product.materiaux,
    ['Bois', 'Métal']
  );
}

console.log('\nErreurs signalées');
{
  const cases = [
    ['référence manquante', { __line: 2, nom: 'Test', categorie: 'salons', prix: '1' }, /référence manquante/],
    ['nom manquant', { __line: 2, ref: 'X', categorie: 'salons', prix: '1' }, /nom manquant/],
    ['catégorie manquante', { __line: 2, ref: 'X', nom: 'T', prix: '1' }, /catégorie manquante/],
    ['catégorie inconnue', { __line: 2, ref: 'X', nom: 'T', categorie: 'Bureaux', prix: '1' }, /inconnue/],
    ['prix manquant', { __line: 2, ref: 'X', nom: 'T', categorie: 'salons' }, /prix manquant/],
    ['prix illisible', { __line: 2, ref: 'X', nom: 'T', categorie: 'salons', prix: 'cher' }, /illisible/],
    [
      'disponibilité inconnue',
      { __line: 2, ref: 'X', nom: 'T', categorie: 'salons', prix: '1', disponibilite: 'peut-être' },
      /inconnue/,
    ],
  ];

  for (const [label, row, pattern] of cases) {
    const { errors, product } = mapRow(row, categories);
    if (product !== null) fail(`${label}: la ligne aurait dû être rejetée`);
    else if (!errors.some((e) => pattern.test(e))) fail(`${label}: message inattendu ${JSON.stringify(errors)}`);
    else ok(label);
  }

  // The unknown-category message must name the real options, or the client
  // cannot act on it.
  const { errors } = mapRow(
    { __line: 2, ref: 'X', nom: 'T', categorie: 'Bureaux', prix: '1' },
    categories
  );
  if (!errors[0].includes('Salons')) fail('le message doit lister les catégories existantes');
  else ok('les catégories existantes sont listées');
}

console.log('\nAvertissements, sans blocage');
{
  const { product, warnings } = mapRow(
    { __line: 2, ref: 'X', nom: 'T', categorie: 'salons', prix: '1000', couleurs: 'Beige' },
    categories
  );
  if (!product) fail('un coloris sans code couleur ne doit pas bloquer');
  else {
    eq('couleur par défaut', product.couleurs, [{ nom: 'Beige', hex: '#D8CDB8' }]);
    if (!warnings.some((w) => /sans code couleur/.test(w))) fail('avertissement manquant');
    else ok('avertissement émis');
  }

  const noDims = mapRow({ __line: 2, ref: 'Y', nom: 'T', categorie: 'salons', prix: '1' }, categories);
  if (!noDims.warnings.some((w) => /aucune dimension/.test(w))) fail('dimensions manquantes non signalées');
  else ok('dimensions manquantes signalées');

  const promo = mapRow(
    { __line: 2, ref: 'Z', nom: 'T', categorie: 'salons', prix: '1000', ancienPrix: '900' },
    categories
  );
  eq('ancien prix incohérent ignoré', promo.product.ancienPrix, null);
  if (!promo.warnings.some((w) => /supérieur/.test(w))) fail('promo incohérente non signalée');
  else ok('promo incohérente signalée');
}

console.log('\nValidation du fichier entier');
{
  const rows = [
    { __line: 2, ref: 'A', nom: 'Canapé A', categorie: 'salons', prix: '1000', largeur: '10', hauteur: '10' },
    { __line: 3, ref: 'B', nom: 'Canapé B', categorie: 'salons', prix: '2000', largeur: '10', hauteur: '10' },
  ];
  const { products, errors } = validateBatch(rows, categories);
  eq('fichier valide: tous les produits retenus', products.length, 2);
  eq('fichier valide: aucune erreur', errors.length, 0);
}
{
  // The central promise: one bad row means nothing is imported at all.
  const rows = [
    { __line: 2, ref: 'A', nom: 'Canapé A', categorie: 'salons', prix: '1000', largeur: '10', hauteur: '10' },
    { __line: 3, ref: 'B', nom: 'Canapé B', categorie: 'salons', prix: 'cher', largeur: '10', hauteur: '10' },
  ];
  const { products, errors } = validateBatch(rows, categories);
  if (!errors.length) fail('une ligne fautive doit produire une erreur');
  else ok('une ligne fautive est signalée');
  eq('les lignes valides sont quand même mappées', products.length, 1);
  // The script refuses to write when errors.length > 0, so a partial import
  // cannot happen. This asserts the signal it keys off.
  if (errors.length === 0) fail("le script écrirait alors qu'il ne devrait pas");
  else ok('le script a de quoi refuser l\'écriture');
}
{
  const rows = [
    { __line: 2, ref: 'DUP', nom: 'Premier', categorie: 'salons', prix: '1', largeur: '1', hauteur: '1' },
    { __line: 3, ref: 'dup', nom: 'Second', categorie: 'salons', prix: '1', largeur: '1', hauteur: '1' },
  ];
  const { errors, products } = validateBatch(rows, categories);
  if (!errors.some((e) => /référence en double/.test(e))) fail('doublon de référence non détecté');
  else ok('doublon de référence détecté, casse ignorée');
  eq('le doublon nest pas retenu', products.length, 1);
}
{
  // Two different names that slugify identically would collide on the unique
  // index and on the public URL.
  const rows = [
    { __line: 2, ref: 'A', nom: 'Canapé Été', categorie: 'salons', prix: '1', largeur: '1', hauteur: '1' },
    { __line: 3, ref: 'B', nom: 'Canape Ete', categorie: 'salons', prix: '1', largeur: '1', hauteur: '1' },
  ];
  const { errors } = validateBatch(rows, categories);
  if (!errors.some((e) => /même adresse/.test(e))) fail('collision de slug non détectée');
  else ok('collision de slug détectée');
}
{
  // Every problem in the file is reported, not just the first, because the
  // client fixes them in one pass.
  const rows = [
    { __line: 2, ref: '', nom: 'Sans ref', categorie: 'salons', prix: '1' },
    { __line: 3, ref: 'B', nom: '', categorie: 'salons', prix: '1' },
    { __line: 4, ref: 'C', nom: 'T', categorie: 'Bureaux', prix: '1' },
  ];
  const { errors, products } = validateBatch(rows, categories);
  eq('toutes les erreurs remontent', errors.length >= 3, true);
  eq('aucun produit retenu', products.length, 0);
}

console.log('\nModèle fourni');
{
  const csv = toCsv(COLUMNS, TEMPLATE_ROWS);
  const { rows, headers } = parseCsv(csv);
  eq('colonnes du modèle', headers.length, COLUMNS.length);
  eq('lignes du modèle', rows.length, TEMPLATE_ROWS.length);

  const templateCats = new Map([
    ['salons', { _id: SALONS, nom: 'Salons', slug: 'salons' }],
    ['tables & chaises', { _id: TABLES, nom: 'Tables & Chaises', slug: 'tables-et-chaises' }],
  ]);
  for (const row of rows) {
    const { errors } = mapRow(row, templateCats);
    if (errors.length) fail(`le modèle doit s'importer tel quel: ${errors.join('; ')}`);
  }
  ok("le modèle s'importe sans erreur");
}

console.log(failures === 0 ? '\nTout est valide.\n' : `\n${failures} problème(s) détecté(s).\n`);
process.exit(failures === 0 ? 0 : 1);
