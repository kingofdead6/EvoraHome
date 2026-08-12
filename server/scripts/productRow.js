import { slugify } from '../utils/slugify.js';
import Product, { DISPONIBILITE } from '../Models/Product.js';

/**
 * Turns one spreadsheet row into a product document, and says clearly what is
 * wrong when it cannot.
 *
 * Kept apart from the import script so the mapping can be tested without a
 * database, which is the only way it could be tested here at all.
 */

export const COLUMNS = [
  'ref',
  'nom',
  'categorie',
  'prix',
  'ancienPrix',
  'description',
  'largeur',
  'profondeur',
  'hauteur',
  'materiaux',
  'couleurs',
  'images',
  'nbImages',
  'disponibilite',
  'delaiLivraison',
  'isFeatured',
  'isNouveau',
];

/** Header aliases, so a client who renames a column still gets an import. */
const ALIASES = {
  reference: 'ref',
  référence: 'ref',
  nom: 'nom',
  name: 'nom',
  designation: 'nom',
  désignation: 'nom',
  categorie: 'categorie',
  catégorie: 'categorie',
  category: 'categorie',
  prix: 'prix',
  price: 'prix',
  'ancien prix': 'ancienPrix',
  ancienprix: 'ancienPrix',
  promo: 'ancienPrix',
  description: 'description',
  largeur: 'largeur',
  profondeur: 'profondeur',
  hauteur: 'hauteur',
  materiaux: 'materiaux',
  matériaux: 'materiaux',
  matiere: 'materiaux',
  couleurs: 'couleurs',
  coloris: 'couleurs',
  images: 'images',
  photos: 'images',
  nbimages: 'nbImages',
  'nb images': 'nbImages',
  disponibilite: 'disponibilite',
  disponibilité: 'disponibilite',
  stock: 'disponibilite',
  delailivraison: 'delaiLivraison',
  'delai livraison': 'delaiLivraison',
  'délai livraison': 'delaiLivraison',
  delai: 'delaiLivraison',
  isfeatured: 'isFeatured',
  vedette: 'isFeatured',
  isnouveau: 'isNouveau',
  nouveau: 'isNouveau',
};

/** Normalises a header cell to a known column name. */
export function normaliseHeader(header) {
  const key = String(header || '').trim().toLowerCase();
  if (COLUMNS.includes(header)) return header;
  return ALIASES[key] || null;
}

/** Accepts the many ways a spreadsheet says yes. */
function parseBool(value) {
  const v = String(value || '').trim().toLowerCase();
  return ['1', 'oui', 'yes', 'true', 'vrai', 'x', 'o'].includes(v);
}

/**
 * Numbers, tolerating what Excel produces: "139 000,00", "139000.00",
 * "139 000 DA", and non-breaking spaces from a French locale.
 */
function parseNumber(value) {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const cleaned = String(value)
    .replace(/ | /g, '')
    .replace(/\s|DA|da/g, '')
    .replace(',', '.');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

/** `Tissu | Bois massif` or `Tissu, Bois massif`. */
function parseList(value) {
  return String(value || '')
    .split(/[|,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * `Beige sable:#D8CDB8 | Gris perle:#B9B7B0`
 * A colour without a hex is kept, defaulting to the brand's sand, so the client
 * is never blocked on picking hex codes.
 */
function parseColours(value, warnings, ref) {
  const out = [];
  for (const chunk of String(value || '').split('|')) {
    const part = chunk.trim();
    if (!part) continue;

    const [nom, hex] = part.split(':').map((s) => (s || '').trim());
    if (!nom) continue;

    if (!hex) {
      warnings.push(`${ref}: coloris "${nom}" sans code couleur, #D8CDB8 utilisé`);
      out.push({ nom, hex: '#D8CDB8' });
      continue;
    }

    const normalised = hex.startsWith('#') ? hex : `#${hex}`;
    if (!/^#[0-9a-fA-F]{6}$/.test(normalised)) {
      warnings.push(`${ref}: code couleur "${hex}" invalide pour "${nom}", #D8CDB8 utilisé`);
      out.push({ nom, hex: '#D8CDB8' });
      continue;
    }

    out.push({ nom, hex: normalised.toUpperCase() });
  }
  return out;
}

/** `EN STOCK`, `sur commande`, `rupture` all land on the right enum value. */
function parseDisponibilite(value) {
  const v = String(value || '').trim().toUpperCase().replace(/[\s-]+/g, '_');
  if (!v) return 'EN_STOCK';
  if (DISPONIBILITE.includes(v)) return v;
  if (v.startsWith('EN_STOCK') || v === 'STOCK' || v === 'DISPONIBLE') return 'EN_STOCK';
  if (v.startsWith('SUR_COMMANDE') || v === 'COMMANDE') return 'SUR_COMMANDE';
  if (v.startsWith('RUPTURE') || v === 'EPUISE' || v === 'ÉPUISÉ') return 'RUPTURE';
  return null;
}

/**
 * Image paths. Either an explicit pipe-separated list, or a count that expands
 * to the /products/<slug>-NN.jpg convention the storefront already uses.
 */
function buildImages(row, slug, nom) {
  const explicit = String(row.images || '')
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);

  if (explicit.length) {
    return explicit.map((url, i) => ({
      url: url.startsWith('http') || url.startsWith('/') ? url : `/products/${url}`,
      alt: i === 0 ? nom : `${nom}, vue ${i + 1}`,
      ordre: i,
    }));
  }

  const count = Number(row.nbImages);
  if (Number.isFinite(count) && count > 0) {
    return Array.from({ length: Math.min(count, 12) }, (_, i) => ({
      url: `/products/${slug}-${String(i + 1).padStart(2, '0')}.jpg`,
      alt: i === 0 ? nom : `${nom}, vue ${i + 1}`,
      ordre: i,
    }));
  }

  return [];
}

/**
 * Maps one row. Returns `{ product, errors, warnings }`.
 *
 * `categoriesBySlug` maps both slug and lowercased name to a category, so the
 * spreadsheet can say either "salons" or "Salons".
 */
export function mapRow(row, categoriesBySlug) {
  const errors = [];
  const warnings = [];
  const where = `ligne ${row.__line}`;

  const ref = String(row.ref || '').trim().toUpperCase();
  const nom = String(row.nom || '').trim();

  if (!ref) errors.push(`${where}: référence manquante`);
  if (!nom) errors.push(`${where}: nom manquant`);

  const label = ref || where;

  // ── Category ───────────────────────────────────────────────────────────────
  const catKey = String(row.categorie || '').trim().toLowerCase();
  const category = categoriesBySlug.get(catKey) || categoriesBySlug.get(slugify(catKey));
  if (!catKey) {
    errors.push(`${label}: catégorie manquante`);
  } else if (!category) {
    const known = [...new Set([...categoriesBySlug.values()].map((c) => c.nom))].join(', ');
    errors.push(`${label}: catégorie "${row.categorie}" inconnue. Catégories existantes: ${known}`);
  }

  // ── Price ──────────────────────────────────────────────────────────────────
  const prix = parseNumber(row.prix);
  if (prix === null) errors.push(`${label}: prix manquant`);
  else if (Number.isNaN(prix)) errors.push(`${label}: prix "${row.prix}" illisible`);
  else if (prix < 0) errors.push(`${label}: prix négatif`);

  const ancienPrix = parseNumber(row.ancienPrix);
  if (Number.isNaN(ancienPrix)) {
    errors.push(`${label}: ancien prix "${row.ancienPrix}" illisible`);
  } else if (ancienPrix !== null && prix !== null && !Number.isNaN(prix) && ancienPrix <= prix) {
    warnings.push(`${label}: ancien prix (${ancienPrix}) n'est pas supérieur au prix (${prix}), ignoré`);
  }

  // ── Dimensions ─────────────────────────────────────────────────────────────
  const dims = {};
  for (const key of ['largeur', 'profondeur', 'hauteur']) {
    const n = parseNumber(row[key]);
    if (Number.isNaN(n)) errors.push(`${label}: ${key} "${row[key]}" illisible`);
    else if (n !== null) dims[key] = n;
  }
  if (!dims.largeur && !dims.hauteur) {
    warnings.push(`${label}: aucune dimension. La fiche produit perd son bloc dimensions.`);
  }

  // ── Availability ───────────────────────────────────────────────────────────
  const disponibilite = parseDisponibilite(row.disponibilite);
  if (disponibilite === null) {
    errors.push(
      `${label}: disponibilité "${row.disponibilite}" inconnue. Valeurs acceptées: en stock, sur commande, rupture`
    );
  }

  const slug = slugify(nom);
  const images = buildImages(row, slug, nom);
  if (!images.length) warnings.push(`${label}: aucune photo`);

  if (errors.length) return { product: null, errors, warnings };

  return {
    errors,
    warnings,
    product: {
      ref,
      nom,
      slug,
      description: String(row.description || '').trim(),
      categoryId: category._id,
      prix,
      ancienPrix: ancienPrix !== null && ancienPrix > prix ? ancienPrix : null,
      dimensions: { ...dims, unite: 'cm' },
      materiaux: parseList(row.materiaux),
      couleurs: parseColours(row.couleurs, warnings, label),
      images,
      disponibilite,
      delaiLivraison: String(row.delaiLivraison || '').trim(),
      isFeatured: parseBool(row.isFeatured),
      isNouveau: parseBool(row.isNouveau),
    },
  };
}

/**
 * Maps and cross-checks a whole file.
 *
 * Cross-row problems only exist at this level: two rows sharing a reference, or
 * two different names that slugify to the same URL. Each row also goes through
 * the real Mongoose validators, the same ones the API runs, so nothing reaches
 * the database that the storefront could not render.
 *
 * Returns every problem in the file rather than stopping at the first, because
 * the client is going to fix them in one pass in Excel.
 */
export function validateBatch(rows, categoriesBySlug) {
  const errors = [];
  const warnings = [];
  const products = [];
  const seenRefs = new Map();
  const seenSlugs = new Map();

  for (const row of rows) {
    const result = mapRow(row, categoriesBySlug);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
    if (!result.product) continue;

    const { ref, slug } = result.product;

    if (seenRefs.has(ref)) {
      errors.push(`${ref}: référence en double (lignes ${seenRefs.get(ref)} et ${row.__line})`);
      continue;
    }
    seenRefs.set(ref, row.__line);

    if (seenSlugs.has(slug)) {
      errors.push(
        `${ref}: ce nom donne la même adresse "${slug}" qu'un autre produit (lignes ${seenSlugs.get(slug)} et ${row.__line}). Différenciez les noms.`
      );
      continue;
    }
    seenSlugs.set(slug, row.__line);

    const validation = new Product(result.product).validateSync();
    if (validation) {
      errors.push(`${ref}: ${Object.values(validation.errors).map((e) => e.message).join('; ')}`);
      continue;
    }

    products.push(result.product);
  }

  return { products, errors, warnings };
}

/** The starter file `--template` writes. */
export const TEMPLATE_ROWS = [
  {
    ref: 'LA CONNER',
    nom: "Canapé d'angle La Conner",
    categorie: 'Salons',
    prix: '289000',
    ancienPrix: '',
    description: 'Angle réversible six places, assise profonde. Structure en hêtre massif.',
    largeur: '310',
    profondeur: '190',
    hauteur: '85',
    materiaux: 'Tissu bouclé | Bois massif | Mousse haute densité',
    couleurs: 'Beige sable:#D8CDB8 | Gris perle:#B9B7B0 | Vert olive:#5A6350',
    images: '',
    nbImages: '4',
    disponibilite: 'en stock',
    delaiLivraison: '5 à 8 jours',
    isFeatured: 'oui',
    isNouveau: 'oui',
  },
  {
    ref: 'VALENCIA',
    nom: 'Table à manger Valencia',
    categorie: 'Tables & Chaises',
    prix: '148000',
    ancienPrix: '175000',
    description: 'Table extensible de huit à dix couverts, plateau en bois massif.',
    largeur: '180',
    profondeur: '100',
    hauteur: '76',
    materiaux: 'Bois massif | Métal',
    couleurs: 'Noyer:#5C4433 | Chêne clair:#C4A882',
    images: '/products/table-a-manger-valencia-01.jpg | /products/table-a-manger-valencia-02.jpg',
    nbImages: '',
    disponibilite: 'sur commande',
    delaiLivraison: '3 à 4 semaines',
    isFeatured: 'non',
    isNouveau: 'non',
  },
];
