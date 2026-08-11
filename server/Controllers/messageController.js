import { asyncHandler } from '../utils/asyncHandler.js';
import Message, { STATUTS_MESSAGE } from '../Models/Message.js';
import { isValidPhone, normalisePhone } from '../Models/User.js';

export const createMessage = asyncHandler(async (req, res) => {
  const { nom, telephone, email, sujet, message } = req.body;

  if (!nom?.trim()) {
    res.status(400);
    throw new Error('Votre nom est requis');
  }
  if (!isValidPhone(telephone)) {
    res.status(400);
    throw new Error('Numéro de téléphone invalide');
  }
  if (!message?.trim()) {
    res.status(400);
    throw new Error('Votre message est vide');
  }

  const created = await Message.create({
    nom: nom.trim(),
    telephone: normalisePhone(telephone),
    email: email?.trim() || '',
    sujet: sujet?.trim() || '',
    message: message.trim(),
  });

  res.status(201).json({ id: created._id, message: 'Message envoyé' });
});

// ── Admin ───────────────────────────────────────────────────────────────────

export const listMessages = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.statut && req.query.statut !== 'TOUS') filter.statut = req.query.statut;
  res.json(await Message.find(filter).sort({ createdAt: -1 }).limit(200));
});

export const updateMessageStatus = asyncHandler(async (req, res) => {
  const { statut } = req.body;
  if (!STATUTS_MESSAGE.includes(statut)) {
    res.status(400);
    throw new Error('Statut invalide');
  }

  const message = await Message.findByIdAndUpdate(req.params.id, { $set: { statut } }, { new: true });
  if (!message) {
    res.status(404);
    throw new Error('Message introuvable');
  }
  res.json(message);
});

export const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findByIdAndDelete(req.params.id);
  if (!message) {
    res.status(404);
    throw new Error('Message introuvable');
  }
  res.json({ message: 'Message supprimé' });
});
