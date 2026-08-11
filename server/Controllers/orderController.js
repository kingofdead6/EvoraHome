import { asyncHandler } from '../utils/asyncHandler.js';
import Order, { STATUTS } from '../Models/Order.js';
import Product from '../Models/Product.js';
import Wilaya from '../Models/Wilaya.js';
import { nextOrderNumber } from '../Models/Counter.js';
import { isValidPhone, normalisePhone } from '../Models/User.js';

/**
 * Which status can follow which. The admin UI only offers legal transitions,
 * and this enforces it server side so a stale tab cannot move a delivered order
 * back into preparation.
 */
const TRANSITIONS = {
  NOUVELLE: ['CONFIRMEE', 'ANNULEE'],
  CONFIRMEE: ['EN_PREPARATION', 'ANNULEE'],
  EN_PREPARATION: ['EXPEDIEE', 'ANNULEE'],
  EXPEDIEE: ['LIVREE', 'ANNULEE'],
  LIVREE: [],
  ANNULEE: [],
};

/**
 * Create an order. Cash on delivery, no payment gateway.
 *
 * Prices and delivery fees are re-read from the database and recomputed here.
 * The totals the client sends are ignored entirely: they are a display concern,
 * and trusting them means anyone can order a 289 000 DA sofa for 1 DA.
 */
export const createOrder = asyncHandler(async (req, res) => {
  const { clientNom, clientTelephone, clientEmail, wilayaId, commune, adresse, items, modeLivraison, noteClient } =
    req.body;

  if (!clientNom?.trim()) {
    res.status(400);
    throw new Error('Votre nom est requis');
  }
  if (!isValidPhone(clientTelephone)) {
    res.status(400);
    throw new Error('Numéro de téléphone invalide. Format attendu: 05, 06 ou 07 suivi de 8 chiffres');
  }
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error('Votre panier est vide');
  }
  if (!['DOMICILE', 'STOP_DESK'].includes(modeLivraison)) {
    res.status(400);
    throw new Error('Mode de livraison invalide');
  }
  if (!commune?.trim()) {
    res.status(400);
    throw new Error('La commune est requise');
  }
  if (modeLivraison === 'DOMICILE' && !adresse?.trim()) {
    res.status(400);
    throw new Error("L'adresse est requise pour une livraison à domicile");
  }

  const wilaya = await Wilaya.findById(wilayaId);
  if (!wilaya) {
    res.status(400);
    throw new Error('Wilaya invalide');
  }
  if (!wilaya.isActive) {
    res.status(400);
    throw new Error(
      `Nous ne livrons pas encore à ${wilaya.nom}. Appelez-nous, nous trouverons une solution.`
    );
  }

  // Re-read every product. This also rejects an order for something deleted
  // while it sat in a cart.
  const products = await Product.find({ _id: { $in: items.map((i) => i.productId) } });
  const byId = new Map(products.map((p) => [p._id.toString(), p]));

  const resolved = items.map((item) => {
    const product = byId.get(String(item.productId));
    if (!product) {
      res.status(400);
      throw new Error("Un article de votre panier n'est plus disponible");
    }
    if (product.disponibilite === 'RUPTURE') {
      res.status(400);
      throw new Error(`${product.nom} est en rupture de stock`);
    }

    const quantite = Math.max(1, Math.min(Number(item.quantite) || 1, 20));
    return {
      productId: product._id,
      ref: product.ref,
      nom: product.nom,
      prix: product.prix,
      quantite,
      couleur: item.couleur || '',
      image: product.images?.[0]?.url || '',
    };
  });

  const sousTotal = resolved.reduce((sum, i) => sum + i.prix * i.quantite, 0);
  const fraisLivraison = wilaya.fraisPour(modeLivraison);

  const order = await Order.create({
    numero: await nextOrderNumber(),
    clientNom: clientNom.trim(),
    clientTelephone: normalisePhone(clientTelephone),
    clientEmail: clientEmail?.trim() || '',
    userId: req.user?._id ?? null,
    wilayaId: wilaya._id,
    wilayaNom: wilaya.nom,
    commune: commune.trim(),
    adresse: adresse?.trim() || '',
    items: resolved,
    sousTotal,
    fraisLivraison,
    total: sousTotal + fraisLivraison,
    modeLivraison,
    noteClient: noteClient?.trim() || '',
  });

  res.status(201).json(order);
});

/**
 * Public order lookup for the confirmation page. Requires the order number AND
 * the phone number it was placed with, so a guessed number reveals nothing.
 */
export const lookupOrder = asyncHandler(async (req, res) => {
  const { numero, telephone } = req.query;

  if (!numero || !telephone) {
    res.status(400);
    throw new Error('Numéro de commande et téléphone requis');
  }

  const order = await Order.findOne({
    numero: String(numero).trim().toUpperCase(),
    clientTelephone: normalisePhone(telephone),
  });

  if (!order) {
    res.status(404);
    throw new Error('Commande introuvable. Vérifiez le numéro et le téléphone.');
  }

  res.json(order);
});

/** The logged-in customer's own orders. */
export const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    // Orders placed as a guest with the same phone number are included, so
    // signing up later does not hide a customer's history from them.
    $or: [{ userId: req.user._id }, { clientTelephone: req.user.telephone }],
  }).sort({ createdAt: -1 });
  res.json(orders);
});

// ── Admin ───────────────────────────────────────────────────────────────────

export const listOrders = asyncHandler(async (req, res) => {
  const { statut, q, page = 1, limit = 30 } = req.query;

  const filter = {};
  if (statut && statut !== 'TOUTES') filter.statut = statut;
  if (q) {
    const rx = new RegExp(String(q).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ numero: rx }, { clientNom: rx }, { clientTelephone: rx }];
  }

  const perPage = Math.min(Number(limit) || 30, 100);
  const current = Math.max(Number(page) || 1, 1);

  const [orders, total, counts] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((current - 1) * perPage).limit(perPage).lean(),
    Order.countDocuments(filter),
    Order.aggregate([{ $group: { _id: '$statut', count: { $sum: 1 } } }]),
  ]);

  res.json({
    orders,
    total,
    page: current,
    pages: Math.ceil(total / perPage),
    counts: Object.fromEntries(counts.map((c) => [c._id, c.count])),
  });
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('wilayaId', 'nom code');
  if (!order) {
    res.status(404);
    throw new Error('Commande introuvable');
  }
  res.json(order);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { statut } = req.body;

  if (!STATUTS.includes(statut)) {
    res.status(400);
    throw new Error('Statut invalide');
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Commande introuvable');
  }

  if (order.statut === statut) return res.json(order);

  if (!TRANSITIONS[order.statut].includes(statut)) {
    res.status(400);
    throw new Error(
      `Une commande ${order.statut.toLowerCase()} ne peut pas passer à ${statut.toLowerCase()}`
    );
  }

  order.statut = statut;
  await order.save();
  return res.json(order);
});

export const updateOrderNote = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { $set: { noteInterne: req.body.noteInterne || '' } },
    { new: true }
  );
  if (!order) {
    res.status(404);
    throw new Error('Commande introuvable');
  }
  res.json(order);
});

/** Which statuses this order may move to. Drives the admin's buttons. */
export const allowedTransitions = (statut) => TRANSITIONS[statut] || [];
