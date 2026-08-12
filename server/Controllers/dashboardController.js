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
/** Days of history the dashboard trend covers. */
const TREND_DAYS = 30;

/** `YYYY-MM-DD` in local time. Mongo's $dateToString would use UTC and shift
 *  every order placed after 01:00 Algiers time into the wrong bucket. */
function dayKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Fills the gaps in a sparse daily aggregate.
 *
 * Mongo only returns days that had orders. Plotting that directly draws a line
 * straight from Monday to Thursday as though Tuesday and Wednesday did not
 * exist, which reads as a gentle slope rather than as two days of nothing. The
 * chart needs one point per day, zero included.
 */
function fillDays(rows, days) {
  const byDay = new Map(rows.map((r) => [r._id, r]));
  const out = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  cursor.setDate(cursor.getDate() - (days - 1));

  for (let i = 0; i < days; i += 1) {
    const key = dayKey(cursor);
    const row = byDay.get(key);
    out.push({
      date: key,
      commandes: row?.commandes ?? 0,
      revenus: row?.revenus ?? 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

export const getDashboard = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const startOfTrend = new Date(startOfDay);
  startOfTrend.setDate(startOfTrend.getDate() - (TREND_DAYS - 1));

  // Previous month, for the revenue comparison. Month 0 rolls back correctly.
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    commandesAujourdhui,
    nouvellesCommandes,
    revenusMois,
    revenusMoisPrecedent,
    enRupture,
    messagesNonLus,
    recentes,
    parStatut,
    trendRows,
    parCategorie,
  ] = await Promise.all([
    Order.countDocuments({ createdAt: { $gte: startOfDay } }),
    Order.countDocuments({ statut: 'NOUVELLE' }),
    Order.aggregate([
      { $match: { statut: 'LIVREE', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      {
        $match: {
          statut: 'LIVREE',
          createdAt: { $gte: startOfPrevMonth, $lt: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Product.find({ disponibilite: 'RUPTURE' }).select('ref nom prix images').limit(20).lean(),
    Message.countDocuments({ statut: 'NOUVEAU' }),
    Order.find().sort({ createdAt: -1 }).limit(8).lean(),
    Order.aggregate([{ $group: { _id: '$statut', count: { $sum: 1 } } }]),

    // Daily orders and delivered revenue over the trend window. Revenue is
    // conditional so a day with orders that were never delivered still shows
    // its order count without inventing income.
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfTrend } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
              // Algiers is UTC+1 year-round, no DST.
              timezone: '+01:00',
            },
          },
          commandes: { $sum: 1 },
          revenus: {
            $sum: { $cond: [{ $eq: ['$statut', 'LIVREE'] }, '$total', 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // Units sold per category, delivered orders only. Order items store a
    // productId, so the category is looked up through the product.
    Order.aggregate([
      { $match: { statut: 'LIVREE' } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'produit',
        },
      },
      { $unwind: '$produit' },
      {
        $lookup: {
          from: 'categories',
          localField: 'produit.categoryId',
          foreignField: '_id',
          as: 'categorie',
        },
      },
      { $unwind: '$categorie' },
      {
        $group: {
          _id: '$categorie.nom',
          quantite: { $sum: '$items.quantite' },
          revenus: { $sum: { $multiply: ['$items.prix', '$items.quantite'] } },
        },
      },
      { $sort: { revenus: -1 } },
      { $limit: 6 },
    ]),
  ]);

  res.json({
    commandesAujourdhui,
    nouvellesCommandes,
    revenusMois: revenusMois[0]?.total ?? 0,
    revenusMoisPrecedent: revenusMoisPrecedent[0]?.total ?? 0,
    commandesLivreesMois: revenusMois[0]?.count ?? 0,
    enRupture,
    messagesNonLus,
    recentes,
    parStatut: Object.fromEntries(parStatut.map((s) => [s._id, s.count])),
    tendance: fillDays(trendRows, TREND_DAYS),
    parCategorie: parCategorie.map((c) => ({
      nom: c._id,
      quantite: c.quantite,
      revenus: c.revenus,
    })),
  });
});
