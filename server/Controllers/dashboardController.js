import { asyncHandler } from '../utils/asyncHandler.js';
import Order from '../Models/Order.js';
import Product from '../Models/Product.js';
import Message from '../Models/Message.js';

/**
 * Everything the admin dashboard shows, in one request.
 *
 * Revenue counts only orders that reached LIVREE. Counting NOUVELLE as revenue
 * would inflate the number with orders that get cancelled on the phone, which
 * for cash on delivery is a real and regular occurrence.
 */
export const getDashboard = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    commandesAujourdhui,
    nouvellesCommandes,
    revenusMois,
    enRupture,
    messagesNonLus,
    recentes,
    parStatut,
  ] = await Promise.all([
    Order.countDocuments({ createdAt: { $gte: startOfDay } }),
    Order.countDocuments({ statut: 'NOUVELLE' }),
    Order.aggregate([
      { $match: { statut: 'LIVREE', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
    ]),
    Product.find({ disponibilite: 'RUPTURE' }).select('ref nom prix images').limit(20).lean(),
    Message.countDocuments({ statut: 'NOUVEAU' }),
    Order.find().sort({ createdAt: -1 }).limit(8).lean(),
    Order.aggregate([{ $group: { _id: '$statut', count: { $sum: 1 } } }]),
  ]);

  res.json({
    commandesAujourdhui,
    nouvellesCommandes,
    revenusMois: revenusMois[0]?.total ?? 0,
    commandesLivreesMois: revenusMois[0]?.count ?? 0,
    enRupture,
    messagesNonLus,
    recentes,
    parStatut: Object.fromEntries(parStatut.map((s) => [s._id, s.count])),
  });
});
