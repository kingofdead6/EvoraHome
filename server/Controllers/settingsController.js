import { asyncHandler } from '../utils/asyncHandler.js';
import Settings, { getSettings, SINGLETON_ID } from '../Models/Settings.js';

/**
 * Public. The storefront reads this on boot so the client can change their
 * phone number, hours or hero copy from the admin without a redeploy. The
 * front end falls back to the constants in brand.js if this is empty.
 */
export const readSettings = asyncHandler(async (req, res) => {
  res.json(await getSettings());
});

const EDITABLE = [
  'telephone',
  'telephone2',
  'whatsapp',
  'adresse',
  'horaires',
  'instagram',
  'facebook',
  'tiktok',
  'heroTitle',
  'heroSubtitle',
];

export const updateSettings = asyncHandler(async (req, res) => {
  const update = {};
  for (const key of EDITABLE) {
    if (req.body[key] !== undefined) update[key] = String(req.body[key]).trim();
  }

  const settings = await Settings.findByIdAndUpdate(
    SINGLETON_ID,
    { $set: update },
    { new: true, upsert: true }
  );

  res.json(settings);
});
