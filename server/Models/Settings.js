import mongoose from 'mongoose';

/**
 * A single record, edited from the admin. Everything here is content the client
 * will want to change without calling anyone: their phone number, their opening
 * hours, the hero copy.
 *
 * Enforced as a singleton by a fixed _id rather than by convention, so a second
 * record cannot quietly appear and start winning races.
 */
const SINGLETON_ID = 'evora-settings';

const settingsSchema = new mongoose.Schema(
  {
    _id: { type: String, default: SINGLETON_ID },

    telephone: { type: String, trim: true, default: '' },
    telephone2: { type: String, trim: true, default: '' },
    whatsapp: { type: String, trim: true, default: '' },
    adresse: { type: String, trim: true, default: '' },
    horaires: { type: String, trim: true, default: '' },

    instagram: { type: String, trim: true, default: '' },
    facebook: { type: String, trim: true, default: '' },
    tiktok: { type: String, trim: true, default: '' },

    heroTitle: { type: String, trim: true, default: '' },
    heroSubtitle: { type: String, trim: true, default: '' },
  },
  { timestamps: true, _id: false }
);

const Settings = mongoose.model('Settings', settingsSchema);

/** Always returns a record, creating the singleton on first call. */
export async function getSettings() {
  return Settings.findByIdAndUpdate(
    SINGLETON_ID,
    { $setOnInsert: { _id: SINGLETON_ID } },
    { new: true, upsert: true }
  );
}

export { SINGLETON_ID };
export default Settings;
