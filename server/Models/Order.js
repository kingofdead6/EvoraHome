import mongoose from 'mongoose';

export const MODES_LIVRAISON = ['DOMICILE', 'STOP_DESK'];
export const STATUTS = ['NOUVELLE', 'CONFIRMEE', 'EN_PREPARATION', 'EXPEDIEE', 'LIVREE', 'ANNULEE'];

/**
 * Line items copy the product's ref, name and price at the time of ordering.
 * This is deliberate denormalisation: the client edits prices regularly, and an
 * order that silently re-prices itself six weeks later is worse than useless
 * when the delivery driver is standing at the door with a printed slip.
 */
const itemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    ref: { type: String, required: true, trim: true },
    nom: { type: String, required: true, trim: true },
    prix: { type: Number, required: true, min: 0 },
    quantite: { type: Number, required: true, min: 1 },
    couleur: { type: String, trim: true, default: '' },
    image: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    // Human-readable, spoken over the phone: EVH-2026-0001.
    numero: { type: String, required: true, unique: true, index: true },

    clientNom: { type: String, required: true, trim: true },
    // The identifier. Not email: email-first loses orders in Algeria.
    clientTelephone: { type: String, required: true, trim: true, index: true },
    clientEmail: { type: String, trim: true, lowercase: true, default: '' },

    // Set when a logged-in customer ordered. Guest orders leave it null, and
    // guest checkout is the default path.
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },

    wilayaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wilaya', required: true },
    wilayaNom: { type: String, required: true, trim: true },
    commune: { type: String, required: true, trim: true },
    adresse: { type: String, trim: true, default: '' },

    items: {
      type: [itemSchema],
      required: true,
      validate: [(v) => v.length > 0, 'Une commande doit contenir au moins un article'],
    },

    sousTotal: { type: Number, required: true, min: 0 },
    fraisLivraison: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },

    modeLivraison: { type: String, enum: MODES_LIVRAISON, required: true },
    statut: { type: String, enum: STATUTS, default: 'NOUVELLE', index: true },

    noteClient: { type: String, trim: true, default: '' },
    noteInterne: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

// The admin dashboard reads "today's orders" and "new orders" on every load.
orderSchema.index({ createdAt: -1 });
orderSchema.index({ statut: 1, createdAt: -1 });

export default mongoose.model('Order', orderSchema);
