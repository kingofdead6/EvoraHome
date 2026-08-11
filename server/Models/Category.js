import mongoose from 'mongoose';

/**
 * The seven categories the shop actually sells. `ordre` drives the order they
 * appear in the nav and on the home grid, and is editable from the admin, so
 * the client can promote Salon de Jardin in summer without a deploy.
 */
const categorySchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, trim: true, unique: true, lowercase: true, index: true },
    description: { type: String, trim: true, default: '' },
    image: { type: String, default: '' },
    ordre: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.index({ isActive: 1, ordre: 1 });

export default mongoose.model('Category', categorySchema);
