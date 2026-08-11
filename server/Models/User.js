import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const ROLES = ['CLIENT', 'ADMIN', 'SUPER_ADMIN'];

/** Normalises 0540870382, +213 540 87 03 82 and 213540870382 to one form. */
export function normalisePhone(raw) {
  let digits = String(raw || '').replace(/\D/g, '');
  if (digits.startsWith('213')) digits = `0${digits.slice(3)}`;
  return digits;
}

/** Algerian mobile: 10 digits starting 05, 06 or 07. Landlines start 0[2-4]. */
export function isValidPhone(raw) {
  return /^0(5|6|7)\d{8}$/.test(normalisePhone(raw));
}

const adresseSchema = new mongoose.Schema(
  {
    libelle: { type: String, trim: true, default: 'Domicile' },
    wilayaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wilaya' },
    commune: { type: String, trim: true, default: '' },
    adresse: { type: String, trim: true, default: '' },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },

    // The login identifier. Stored normalised so 0540... and +213540... are the
    // same account.
    telephone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
      set: normalisePhone,
    },
    email: { type: String, trim: true, lowercase: true, default: undefined },

    // `select: false` so the hash never leaks through a stray .find().
    passwordHash: { type: String, required: true, select: false },

    role: { type: String, enum: ROLES, default: 'CLIENT', index: true },

    adresses: { type: [adresseSchema], default: [] },
    favoris: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
);

/**
 * Hash on the way in. The template's version had a bug worth not repeating: its
 * pre-save hook never called next(), so every save hung until Mongoose's
 * timeout. This one awaits and returns.
 */
userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('passwordHash')) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});

userSchema.methods.verifyPassword = function verifyPassword(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { email: { $type: 'string', $ne: '' } } });

userSchema.methods.toPublic = function toPublic() {
  return {
    id: this._id,
    nom: this.nom,
    telephone: this.telephone,
    email: this.email,
    role: this.role,
    adresses: this.adresses,
    favoris: this.favoris,
  };
};

export default mongoose.model('User', userSchema);
