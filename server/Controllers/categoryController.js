import { asyncHandler } from '../utils/asyncHandler.js';
import Category from '../Models/Category.js';
import Product from '../Models/Product.js';
import { slugify } from '../utils/slugify.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

/** Public list, ordered by `ordre`. Includes a product count per category. */
export const listCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ ordre: 1, nom: 1 }).lean();

  const counts = await Product.aggregate([
    { $group: { _id: '$categoryId', count: { $sum: 1 } } },
  ]);
  const byId = new Map(counts.map((c) => [String(c._id), c.count]));

  res.json(categories.map((c) => ({ ...c, nbProduits: byId.get(String(c._id)) || 0 })));
});

export const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) {
    res.status(404);
    throw new Error('Catégorie introuvable');
  }
  res.json(category);
});

// ── Admin ───────────────────────────────────────────────────────────────────

export const listAllCategories = asyncHandler(async (req, res) => {
  res.json(await Category.find().sort({ ordre: 1, nom: 1 }));
});

export const createCategory = asyncHandler(async (req, res) => {
  const { nom, description, ordre } = req.body;
  if (!nom?.trim()) {
    res.status(400);
    throw new Error('Le nom est requis');
  }

  const image = req.file ? (await uploadToCloudinary(req.file)).url : req.body.image || '';
  const last = await Category.findOne().sort({ ordre: -1 });

  const category = await Category.create({
    nom: nom.trim(),
    slug: slugify(nom),
    description: description || '',
    image,
    ordre: ordre !== undefined ? Number(ordre) : (last?.ordre ?? 0) + 1,
  });

  res.status(201).json(category);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Catégorie introuvable');
  }

  if (req.body.nom !== undefined) {
    category.nom = req.body.nom.trim();
    category.slug = slugify(req.body.nom);
  }
  if (req.body.description !== undefined) category.description = req.body.description;
  if (req.body.ordre !== undefined) category.ordre = Number(req.body.ordre);
  if (req.body.isActive !== undefined) {
    category.isActive = req.body.isActive === 'true' || req.body.isActive === true;
  }
  if (req.file) category.image = (await uploadToCloudinary(req.file)).url;
  else if (req.body.image !== undefined) category.image = req.body.image;

  await category.save();
  res.json(category);
});

/**
 * Deleting a category would orphan its products, which then vanish from every
 * listing while still existing. Refuse and tell the admin what to do instead.
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const count = await Product.countDocuments({ categoryId: req.params.id });
  if (count > 0) {
    res.status(409);
    throw new Error(
      `Cette catégorie contient ${count} produit(s). Déplacez-les ou désactivez la catégorie.`
    );
  }

  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Catégorie introuvable');
  }
  res.json({ message: 'Catégorie supprimée' });
});

/** Bulk reorder from the admin's drag-and-drop list. */
export const reorderCategories = asyncHandler(async (req, res) => {
  const { ordres } = req.body; // [{ id, ordre }]
  if (!Array.isArray(ordres)) {
    res.status(400);
    throw new Error('Format invalide');
  }

  await Category.bulkWrite(
    ordres.map(({ id, ordre }) => ({
      updateOne: { filter: { _id: id }, update: { $set: { ordre: Number(ordre) } } },
    }))
  );

  res.json(await Category.find().sort({ ordre: 1 }));
});
