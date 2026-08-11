import { asyncHandler } from '../utils/asyncHandler.js';
import Wilaya from '../Models/Wilaya.js';

/**
 * Public list for the checkout's wilaya select. Inactive wilayas are included
 * with their flag, so the form can show them as "livraison non disponible"
 * rather than silently omitting a customer's own wilaya, which reads as a bug.
 */
export const listWilayas = asyncHandler(async (req, res) => {
  res.json(await Wilaya.find().sort({ code: 1 }).lean());
});

/**
 * Delivery quote for one wilaya and mode. The cart calls this so the customer
 * sees the real cost before confirming. The order endpoint recomputes it
 * anyway; this is display only.
 */
export const quoteDelivery = asyncHandler(async (req, res) => {
  const { wilayaId, mode = 'DOMICILE' } = req.query;

  const wilaya = await Wilaya.findById(wilayaId);
  if (!wilaya) {
    res.status(404);
    throw new Error('Wilaya introuvable');
  }

  if (!wilaya.isActive) {
    return res.json({
      disponible: false,
      wilaya: wilaya.nom,
      frais: null,
      message: `Nous ne livrons pas encore à ${wilaya.nom}. Appelez-nous, nous trouverons une solution.`,
    });
  }

  return res.json({
    disponible: true,
    wilaya: wilaya.nom,
    mode,
    frais: wilaya.fraisPour(mode),
    fraisDomicile: wilaya.fraisDomicile,
    fraisStopDesk: wilaya.fraisStopDesk,
  });
});

// ── Admin ───────────────────────────────────────────────────────────────────

export const updateWilaya = asyncHandler(async (req, res) => {
  const { fraisDomicile, fraisStopDesk, isActive } = req.body;
  const wilaya = await Wilaya.findById(req.params.id);

  if (!wilaya) {
    res.status(404);
    throw new Error('Wilaya introuvable');
  }

  if (fraisDomicile !== undefined) wilaya.fraisDomicile = Number(fraisDomicile);
  if (fraisStopDesk !== undefined) wilaya.fraisStopDesk = Number(fraisStopDesk);
  if (isActive !== undefined) wilaya.isActive = isActive === 'true' || isActive === true;

  await wilaya.save();
  res.json(wilaya);
});

/** Bulk fee edit, so the client can retune a whole band in one save. */
export const bulkUpdateWilayas = asyncHandler(async (req, res) => {
  const { wilayas } = req.body; // [{ id, fraisDomicile, fraisStopDesk, isActive }]
  if (!Array.isArray(wilayas)) {
    res.status(400);
    throw new Error('Format invalide');
  }

  await Wilaya.bulkWrite(
    wilayas.map((w) => {
      const set = {};
      if (w.fraisDomicile !== undefined) set.fraisDomicile = Number(w.fraisDomicile);
      if (w.fraisStopDesk !== undefined) set.fraisStopDesk = Number(w.fraisStopDesk);
      if (w.isActive !== undefined) set.isActive = Boolean(w.isActive);
      return { updateOne: { filter: { _id: w.id }, update: { $set: set } } };
    })
  );

  res.json(await Wilaya.find().sort({ code: 1 }));
});
