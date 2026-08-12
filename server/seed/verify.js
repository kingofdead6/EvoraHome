/**
 * Validates the seed data against the Mongoose schemas without a database.
 *
 *   node seed/verify.js
 *
 * Every document the seed would write is built and run through
 * `validateSync()`, which is the same validation the real insert performs. It
 * catches missing required fields, bad enum values, malformed colour hexes and
 * duplicate slugs or refs before anyone points this at a live database.
 *
 * Run this after editing catalogue.js or wilayas.js.
 */

import mongoose from 'mongoose';

import Category from '../Models/Category.js';
import Product from '../Models/Product.js';
import Wilaya from '../Models/Wilaya.js';
import Order from '../Models/Order.js';
import Message from '../Models/Message.js';
import { normalisePhone, isValidPhone } from '../Models/User.js';

import { CATEGORIES, PRODUITS } from './catalogue.js';
import { WILAYAS } from './wilayas.js';
import { PRODUCT_PHOTOS, CATEGORY_PHOTOS, galleryFor } from './images.js';
import { slugify } from '../utils/slugify.js';

let failures = 0;
const fail = (msg) => {
  failures += 1;
  console.error(`  FAIL  ${msg}`);
};
const ok = (msg) => console.log(`  ok    ${msg}`);

function validate(label, doc) {
  const err = doc.validateSync();
  if (err) {
    fail(`${label}: ${Object.values(err.errors).map((e) => e.message).join('; ')}`);
    return false;
  }
  return true;
}

function checkUnique(label, values) {
  const seen = new Set();
  const dupes = new Set();
  for (const v of values) {
    if (seen.has(v)) dupes.add(v);
    seen.add(v);
  }
  if (dupes.size) fail(`${label}: doublons ${[...dupes].join(', ')}`);
  else ok(`${label}: ${values.length} valeurs uniques`);
}

console.log('\nCatégories');
const slugsByName = new Map();
for (const cat of CATEGORIES) {
  if (validate(`catégorie ${cat.nom}`, new Category(cat))) slugsByName.set(cat.slug, cat);
}
checkUnique('slugs catégorie', CATEGORIES.map((c) => c.slug));
if (CATEGORIES.length !== 7) fail(`attendu 7 catégories, trouvé ${CATEGORIES.length}`);
else ok('7 catégories');

console.log('\nProduits');
const fakeCategoryId = new mongoose.Types.ObjectId();
const productSlugs = [];
for (const p of PRODUITS) {
  const slug = slugify(p.nom);
  productSlugs.push(slug);

  if (!slugsByName.has(p.categorie)) fail(`${p.ref}: catégorie inconnue "${p.categorie}"`);

  const { categorie, nbImages, ...rest } = p;
  const doc = new Product({
    ...rest,
    slug,
    categoryId: fakeCategoryId,
    dimensions: { ...p.dimensions, unite: 'cm' },
    images: galleryFor(PRODUCT_PHOTOS[p.ref], nbImages, p.nom, slug),
  });
  validate(`produit ${p.ref}`, doc);

  // Business rules the schema cannot express.
  if (p.prix < 15000 || p.prix > 450000) fail(`${p.ref}: prix ${p.prix} hors de la fourchette 15000-450000`);
  if (p.ancienPrix && p.ancienPrix <= p.prix) fail(`${p.ref}: ancienPrix doit être supérieur au prix`);
  if (!p.materiaux?.length) fail(`${p.ref}: aucun matériau`);
  if (!p.couleurs?.length) fail(`${p.ref}: aucune couleur`);
  if (!nbImages || nbImages < 1) fail(`${p.ref}: aucune image`);
  if (!p.dimensions?.largeur || !p.dimensions?.hauteur) fail(`${p.ref}: dimensions incomplètes`);
  if (!p.delaiLivraison) fail(`${p.ref}: délai de livraison manquant`);
}
checkUnique('refs produit', PRODUITS.map((p) => p.ref));
checkUnique('slugs produit', productSlugs);

if (PRODUITS.length < 30 || PRODUITS.length > 40) {
  fail(`attendu 30 à 40 produits, trouvé ${PRODUITS.length}`);
} else {
  ok(`${PRODUITS.length} produits`);
}

// Every category needs stock, or the listing page ships an empty state.
for (const cat of CATEGORIES) {
  const n = PRODUITS.filter((p) => p.categorie === cat.slug).length;
  if (n === 0) fail(`catégorie ${cat.nom}: aucun produit`);
  else ok(`${cat.nom}: ${n} produits`);
}

// The home page needs featured products and the badges need exercising.
const featured = PRODUITS.filter((p) => p.isFeatured).length;
const nouveaux = PRODUITS.filter((p) => p.isNouveau).length;
const promos = PRODUITS.filter((p) => p.ancienPrix).length;
if (featured < 3) fail(`seulement ${featured} produits en vedette`);
else ok(`${featured} en vedette, ${nouveaux} nouveautés, ${promos} en promotion`);

// Each availability state must appear, so the UI for all three is exercised.
for (const d of ['EN_STOCK', 'SUR_COMMANDE', 'RUPTURE']) {
  const n = PRODUITS.filter((p) => p.disponibilite === d).length;
  if (n === 0) fail(`aucun produit ${d}`);
  else ok(`${d}: ${n}`);
}

// A single-image product must exist: the gallery has to hold up without a strip.
if (!PRODUITS.some((p) => p.nbImages === 1)) fail('aucun produit à une seule image');
else ok('produits à une seule image présents');

// Every product and every category must have a photograph declared. A missing
// entry here is what puts an empty greige frame on the storefront.
console.log('\nPhotographies');
const sansPhoto = PRODUITS.filter((p) => !PRODUCT_PHOTOS[p.ref]).map((p) => p.ref);
if (sansPhoto.length) fail(`produits sans photo: ${sansPhoto.join(', ')}`);
else ok(`${PRODUITS.length} produits avec une photo`);

const catsSansPhoto = CATEGORIES.filter((c) => !CATEGORY_PHOTOS[c.slug]).map((c) => c.slug);
if (catsSansPhoto.length) fail(`catégories sans photo: ${catsSansPhoto.join(', ')}`);
else ok(`${CATEGORIES.length} catégories avec une photo`);

// Two products sharing a photograph reads as a copy-paste error on the grid.
checkUnique('photos produit', Object.values(PRODUCT_PHOTOS));
checkUnique('photos catégorie', Object.values(CATEGORY_PHOTOS));

console.log('\nWilayas');
for (const w of WILAYAS) validate(`wilaya ${w.code} ${w.nom}`, new Wilaya(w));
checkUnique('codes wilaya', WILAYAS.map((w) => w.code));
checkUnique('noms wilaya', WILAYAS.map((w) => w.nom));
if (WILAYAS.length !== 58) fail(`attendu 58 wilayas, trouvé ${WILAYAS.length}`);
else ok('58 wilayas');

const codes = WILAYAS.map((w) => w.code).sort((a, b) => a - b);
const missing = [];
for (let i = 1; i <= 58; i += 1) if (!codes.includes(i)) missing.push(i);
if (missing.length) fail(`codes manquants: ${missing.join(', ')}`);
else ok('codes 1 à 58 complets');

for (const w of WILAYAS) {
  if (w.fraisStopDesk > w.fraisDomicile) {
    fail(`${w.nom}: stop desk (${w.fraisStopDesk}) plus cher que domicile (${w.fraisDomicile})`);
  }
}
ok('stop desk toujours au plus égal au domicile');

const constantine = WILAYAS.find((w) => w.code === 25);
if (!constantine) fail('Constantine (25) absente');
else if (constantine.fraisDomicile !== Math.min(...WILAYAS.map((w) => w.fraisDomicile))) {
  fail('Constantine devrait être dans la bande la moins chère');
} else ok('Constantine dans la bande locale');

console.log('\nTéléphone');
const phoneCases = [
  ['0540870382', '0540870382', true],
  ['+213 540 87 03 82', '0540870382', true],
  ['213540870382', '0540870382', true],
  ['0661234567', '0661234567', true],
  ['0771234567', '0771234567', true],
  ['031921234', '031921234', false], // landline, rejected as a login identifier
  ['12345', '12345', false],
  ['', '', false],
];
for (const [input, expected, valid] of phoneCases) {
  const got = normalisePhone(input);
  if (got !== expected) fail(`normalisePhone("${input}") = "${got}", attendu "${expected}"`);
  if (isValidPhone(input) !== valid) fail(`isValidPhone("${input}") = ${!valid}, attendu ${valid}`);
}
ok(`${phoneCases.length} cas de téléphone`);

console.log('\nCommande');
const order = new Order({
  numero: 'EVH-2026-0001',
  clientNom: 'Test',
  clientTelephone: '0540870382',
  wilayaId: new mongoose.Types.ObjectId(),
  wilayaNom: 'Constantine',
  commune: 'El Khroub',
  adresse: 'Cité 1000 logements',
  items: [{ ref: 'LA CONNER', nom: "Canapé d'angle La Conner", prix: 289000, quantite: 1 }],
  sousTotal: 289000,
  fraisLivraison: 2000,
  total: 291000,
  modeLivraison: 'DOMICILE',
});
validate('commande valide', order);

const emptyOrder = new Order({
  numero: 'EVH-2026-0002',
  clientNom: 'Test',
  clientTelephone: '0540870382',
  wilayaId: new mongoose.Types.ObjectId(),
  wilayaNom: 'Constantine',
  commune: 'El Khroub',
  items: [],
  sousTotal: 0,
  fraisLivraison: 0,
  total: 0,
  modeLivraison: 'DOMICILE',
});
if (!emptyOrder.validateSync()) fail('une commande sans article devrait être rejetée');
else ok('commande sans article rejetée');

const badStatus = new Order({ ...order.toObject(), statut: 'PENDING' });
if (!badStatus.validateSync()) fail('un statut hors enum devrait être rejeté');
else ok('statut hors enum rejeté');

console.log('\nMessage');
validate(
  'message contact',
  new Message({ nom: 'Test', telephone: '0540870382', message: 'Bonjour' })
);

console.log(
  failures === 0 ? '\nTout est valide.\n' : `\n${failures} problème(s) détecté(s).\n`
);
process.exit(failures === 0 ? 0 : 1);
