import mongoose from 'mongoose';

/**
 * Contact form submissions. Not in the brief's model list, but the Contact page
 * has a form and the admin needs somewhere to read it, so it stays. Phone is
 * required and email is not, matching the checkout: this audience gives you a
 * phone number and often does not have an email address to hand.
 */
export const STATUTS_MESSAGE = ['NOUVEAU', 'LU', 'TRAITE'];

const messageSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    telephone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: '' },
    sujet: { type: String, trim: true, default: '' },
    message: { type: String, required: true, trim: true },
    statut: { type: String, enum: STATUTS_MESSAGE, default: 'NOUVEAU', index: true },
  },
  { timestamps: true }
);

messageSchema.index({ createdAt: -1 });

export default mongoose.model('Message', messageSchema);
