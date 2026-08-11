import { asyncHandler } from '../utils/asyncHandler.js';
import Product from '../Models/Product.js';
import Category from '../Models/Category.js';
import { slugify } from '../utils/slugify.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

/**
 * Public listing. Supports every filter the category page offers: category,
 * price range, availability, colour, plus search and sorting.
 *
 * Paginated because the client will keep adding products and an unbounded
 * response is the kind of thing that works fine for a year and then does not.
 */
export const listProducts = asyncHandler(async (req, res) => {
  const {
    category,
    prixMin,
    prixMax,
    disponibilite,
    couleur,
    q,
    featured,
    nouveau,
    sort = 'recent',
    page = 1,
    limit = 24,
  } = req.query;

  const filter = {};

  if (category) {
    const cat = await Category.findOne({ slug: category });
    if (!cat) return res.json({ products: [], total: 0, page: 1, pages: 0 });
    filter.categoryId = cat._id;
  }

  if (prixMin || prixMax) {
    filter.prix = {};
    if (prixMin) filter.prix.$gte = Number(prixMin);
    if (prixMax) filter.prix.$lte = Number(prixMax);
  }

  if (disponibilite) filter.disponibilite = { $in: String(disponibilite).split(',') };
  if (couleur) filter['couleurs.nom'] = { $in: String(couleur).split(',') };
  if (featured === 'true') filter.isFeatured = true;
  if (nouveau === 'true') filter.isNouveau = true;

  if (q) {
    const rx = new RegExp(String(q).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ nom: rx }, { ref: rx }, { description: rx }];
  }

  const SORTS = {
    recent: { createdAt: -1 },
    'prix-asc': { prix: 1 },
    'prix-desc': { prix: -1 },
    nom: { nom: 1 },
  };

  const perPage = Math.min(Number(limit) || 24, 60);
  const current = Math.max(Number(page) || 1, 1);

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('categoryId', 'nom slug')
      .sort(SORTS[sort] || SORTS.recent)
      .skip((current - 1) * perPage)
      .limit(perPage)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return res.json({
    products,
    total,
    page: current,
    pages: Math.ceil(total / perPage),
  });
});

/**
 * Filter options for the listing sidebar, derived from what is actually in the
 * catalogue rather than hardcoded. A colour nobody sells never appears as a
 * filter that returns nothing.
 */
export const getFilterOptions = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.category) {
    const cat = await Category.findOne({ slug: req.query.category });
    if (cat) filter.categoryId = cat._id;
  }

  const [range, couleurs, disponibilites] = await Promise.all([
    Product.aggregate([
      { $match: filter },
      { $group: { _id: null, min: { $min: '$prix' }, max: { $max: '$prix' } } },
    ]),
    Product.aggregate([
      { $match: filter },
      { $unwind: '$couleurs' },
      { $group: { _id: '$couleurs.nom', hex: { $first: '$couleurs.hex' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Product.aggregate([{ $match: filter }, { $group: { _id: '$disponibilite', count: { $sum: 1 } } }]),
  ]);

  res.json({
    prixMin: range[0]?.min ?? 0,
    prixMax: range[0]?.max ?? 0,
    couleurs: couleurs.map((c) => ({ nom: c._id, hex: c.hex, count: c.count })),
    disponibilites: disponibilites.map((d) => ({ valeur: d._id, count: d.count })),
  });
});

/** Product detail, by slug or by id. Instagram links use the slug. */
export const getProduct = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const query = /^[0-9a-fA-F]{24}$/.test(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug };

  const product = await Product.findOne(query).populate('categoryId', 'nom slug').lean();
  if (!product) {
    res.status(404);
    throw new Error('Produit introuvable');
  }

  // A few pieces from the same category, for the bottom of the page.
  const similaires = await Product.find({
    categoryId: product.categoryId?._id ?? product.categoryId,
    _id: { $ne: product._id },
  })
    .limit(4)
    .lean();

  res.json({ product, similaires });
});

// ── Admin ───────────────────────────────────────────────────────────────────

/**
 * Images arrive either as uploaded files (multipart) or as paths the client
 * typed in. Both end up in the same ordered array.
 */
async function resolveImages(req, existing = []) {
  const uploaded = await Promise.all((req.files || []).map((file) => uploadToCloudinary(file)));

  let kept = existing;
  if (req.body.images) {
    try {
      kept = typeof req.body.images === 'string' ? JSON.parse(req.body.images) : req.body.images;
    } catch {
      kept = existing;
    }
  }

  // Re-index after merging so `ordre` always matches array position, whatever
  // the admin dragged around before saving.
  return [...kept, ...uploaded.filter(Boolean)].map((img, i) => ({
    url: img.url,
    alt: img.alt || '',
    ordre: i,
  }));
}

function parseJsonField(value, fallback) {
  if (value === undefined) return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export const createProduct = asyncHandler(async (req, res) => {
  const { ref, nom, description, categoryId, prix, ancienPrix, disponibilite, delaiLivraison } =
    req.body;

  if (!ref?.trim() || !nom?.trim() || !categoryId || prix === undefined) {
    res.status(400);
    throw new Error('Référence, nom, catégorie et prix sont requis');
  }

  const product = await Product.create({
    ref: ref.trim(),
    nom: nom.trim(),
    slug: slugify(nom),
    description: description || '',
    categoryId,
    prix: Number(prix),
    ancienPrix: ancienPrix ? Number(ancienPrix) : null,
    dimensions: parseJsonField(req.body.dimensions, {}),
    materiaux: parseJsonField(req.body.materiaux, []),
    couleurs: parseJsonField(req.body.couleurs, []),
    images: await resolveImages(req),
    disponibilite: disponibilite || 'EN_STOCK',
    delaiLivraison: delaiLivraison || '',
    isFeatured: req.body.isFeatured === 'true' || req.body.isFeatured === true,
    isNouveau: req.body.isNouveau === 'true' || req.body.isNouveau === true,
  });

  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Produit introuvable');
  }

  const b = req.body;
  if (b.ref !== undefined) product.ref = b.ref.trim();
  if (b.nom !== undefined) {
    product.nom = b.nom.trim();
    product.slug = slugify(b.nom);
  }
  if (b.description !== undefined) product.description = b.description;
  if (b.categoryId !== undefined) product.categoryId = b.categoryId;
  if (b.prix !== undefined) product.prix = Number(b.prix);
  if (b.ancienPrix !== undefined) product.ancienPrix = b.ancienPrix ? Number(b.ancienPrix) : null;
  if (b.dimensions !== undefined) product.dimensions = parseJsonField(b.dimensions, {});
  if (b.materiaux !== undefined) product.materiaux = parseJsonField(b.materiaux, []);
  if (b.couleurs !== undefined) product.couleurs = parseJsonField(b.couleurs, []);
  if (b.disponibilite !== undefined) product.disponibilite = b.disponibilite;
  if (b.delaiLivraison !== undefined) product.delaiLivraison = b.delaiLivraison;
  if (b.isFeatured !== undefined) product.isFeatured = b.isFeatured === 'true' || b.isFeatured === true;
  if (b.isNouveau !== undefined) product.isNouveau = b.isNouveau === 'true' || b.isNouveau === true;

  if (b.images !== undefined || req.files?.length) {
    product.images = await resolveImages(req, product.images);
  }

  await product.save();
  res.json(product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Produit introuvable');
  }
  res.json({ message: 'Produit supprimé' });
});
