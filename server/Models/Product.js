import mongoose from 'mongoose';

export const DISPONIBILITE = ['EN_STOCK', 'SUR_COMMANDE', 'RUPTURE'];

/**
 * Ordered gallery image. `ordre` is explicit rather than relying on array
 * position, because the admin reorders images by drag and a sparse reorder is
 * cheaper to persist than rewriting the whole array.
 *
 * `url` points at /products/<slug>-NN.jpg under the client's public directory
 * unless the admin uploaded to Cloudinary, in which case it is an absolute URL.
 */
const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    alt: { type: String, trim: true, default: '' },
    ordre: { type: Number, default: 0 },
  },
  { _id: false }
);

const couleurSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    hex: { type: String, required: true, trim: true, match: /^#[0-9a-fA-F]{6}$/ },
  },
  { _id: false }
);

/**
 * Dimensions are a first-class field, not an extra. The client already
 * publishes a full spec card on every Instagram post, and surfacing it is the
 * single thing that makes this read as a furniture catalogue rather than a
 * generic shop.
 */
const dimensionsSchema = new mongoose.Schema(
  {
    largeur: { type: Number, min: 0, default: null },
    profondeur: { type: Number, min: 0, default: null },
    hauteur: { type: Number, min: 0, default: null },
    unite: { type: String, default: 'cm', trim: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    // Reference code as the client writes it on Instagram, e.g. "LA CONNER".
    ref: { type: String, required: true, trim: true, uppercase: true, unique: true, index: true },
    nom: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true, lowercase: true, index: true },
    description: { type: String, trim: true, default: '' },

    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },

    prix: { type: Number, required: true, min: 0, index: true },
    // Only set during a promo. When present it renders struck through next to prix.
    ancienPrix: { type: Number, min: 0, default: null },

    dimensions: { type: dimensionsSchema, default: () => ({}) },
    materiaux: { type: [String], default: [] },
    couleurs: { type: [couleurSchema], default: [] },
    images: { type: [imageSchema], default: [] },

    disponibilite: { type: String, enum: DISPONIBILITE, default: 'EN_STOCK', index: true },
    delaiLivraison: { type: String, trim: true, default: '' },

    isFeatured: { type: Boolean, default: false, index: true },
    isNouveau: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Category listing sorts by price and filters by availability constantly.
productSchema.index({ categoryId: 1, prix: 1 });
productSchema.index({ nom: 'text', ref: 'text', description: 'text' });

productSchema.methods.imagePrincipale = function imagePrincipale() {
  if (!this.images?.length) return null;
  return [...this.images].sort((a, b) => a.ordre - b.ordre)[0];
};

export default mongoose.model('Product', productSchema);
