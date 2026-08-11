import { asyncHandler } from '../utils/asyncHandler.js';
import User, { normalisePhone, isValidPhone } from '../Models/User.js';
import { signSession, clearSession } from '../Middleware/auth.js';

const MIN_PASSWORD = 6;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Register. Phone number is the identifier, email is optional.
 *
 * An account is never required to place an order: guest checkout is the default
 * path. This exists so a returning customer gets their address pre-filled and
 * can find their favourites and past orders.
 */
export const register = asyncHandler(async (req, res) => {
  const { nom, telephone, email, password } = req.body;
  const cleanEmail = email?.trim().toLowerCase();

  if (!nom?.trim()) {
    res.status(400);
    throw new Error('Votre nom est requis');
  }
  if (!isValidPhone(telephone)) {
    res.status(400);
    throw new Error('Numéro de téléphone invalide. Format attendu: 05, 06 ou 07 suivi de 8 chiffres');
  }
  if (cleanEmail && !EMAIL_REGEX.test(cleanEmail)) {
    res.status(400);
    throw new Error('Adresse email invalide');
  }
  if (!password || password.length < MIN_PASSWORD) {
    res.status(400);
    throw new Error(`Le mot de passe doit contenir au moins ${MIN_PASSWORD} caractères`);
  }

  const existingPhone = await User.findOne({ telephone: normalisePhone(telephone) });
  if (existingPhone) {
    res.status(409);
    throw new Error('Un compte existe déjà avec ce numéro');
  }

  if (cleanEmail) {
    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      res.status(409);
      throw new Error('Un compte existe déjà avec cette adresse email');
    }
  }

  const user = new User({
    nom: nom.trim(),
    telephone,
    email: cleanEmail || undefined,
    passwordHash: password,
    // Role is never taken from the request body. An admin is made by the seed
    // script or by another admin, never by signing up.
    role: 'CLIENT',
  });
  await user.save();

  signSession(res, user);
  res.status(201).json(user.toPublic());
});

/** Login with phone number or email and password. */
export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  const cleanIdentifier = identifier?.trim().toLowerCase();

  if (!cleanIdentifier || !password) {
    res.status(400);
    throw new Error('Téléphone ou email et mot de passe requis');
  }

  let user;
  if (isValidPhone(cleanIdentifier)) {
    user = await User.findOne({ telephone: normalisePhone(cleanIdentifier) }).select('+passwordHash');
  } else if (EMAIL_REGEX.test(cleanIdentifier)) {
    user = await User.findOne({ email: cleanIdentifier }).select('+passwordHash');
  } else {
    res.status(400);
    throw new Error('Identifiant invalide. Utilisez un téléphone ou une adresse email');
  }

  // One message for both cases, so the response cannot be used to discover
  // which accounts exist.
  if (!user || !(await user.verifyPassword(password))) {
    res.status(401);
    throw new Error('Identifiant ou mot de passe incorrect');
  }

  signSession(res, user);
  res.json(user.toPublic());
});

export const logout = asyncHandler(async (req, res) => {
  clearSession(res);
  res.json({ message: 'Déconnecté' });
});

/** Current session. Returns null rather than 401 so the client can boot. */
export const me = asyncHandler(async (req, res) => {
  res.json(req.user ? req.user.toPublic() : null);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { nom, email } = req.body;
  if (nom?.trim()) req.user.nom = nom.trim();
  if (email !== undefined) {
    const cleanEmail = email?.trim().toLowerCase();
    if (cleanEmail && !EMAIL_REGEX.test(cleanEmail)) {
      res.status(400);
      throw new Error('Adresse email invalide');
    }
    if (cleanEmail && cleanEmail !== req.user.email) {
      const existingEmail = await User.findOne({ email: cleanEmail, _id: { $ne: req.user._id } });
      if (existingEmail) {
        res.status(409);
        throw new Error('Cette adresse email est déjà utilisée');
      }
    }
    req.user.email = cleanEmail || undefined;
  }
  await req.user.save();
  res.json(req.user.toPublic());
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!newPassword || newPassword.length < MIN_PASSWORD) {
    res.status(400);
    throw new Error(`Le nouveau mot de passe doit contenir au moins ${MIN_PASSWORD} caractères`);
  }

  const user = await User.findById(req.user._id).select('+passwordHash');
  if (!(await user.verifyPassword(currentPassword || ''))) {
    res.status(401);
    throw new Error('Mot de passe actuel incorrect');
  }

  user.passwordHash = newPassword;
  await user.save();
  res.json({ message: 'Mot de passe modifié' });
});

// ── Addresses ───────────────────────────────────────────────────────────────

export const addAddress = asyncHandler(async (req, res) => {
  const { libelle, wilayaId, commune, adresse, isDefault } = req.body;

  if (!wilayaId || !commune?.trim()) {
    res.status(400);
    throw new Error('Wilaya et commune sont requises');
  }

  if (isDefault) req.user.adresses.forEach((a) => { a.isDefault = false; });

  req.user.adresses.push({
    libelle: libelle?.trim() || 'Domicile',
    wilayaId,
    commune: commune.trim(),
    adresse: adresse?.trim() || '',
    // The first address saved becomes the default automatically.
    isDefault: Boolean(isDefault) || req.user.adresses.length === 0,
  });

  await req.user.save();
  res.status(201).json(req.user.toPublic());
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const address = req.user.adresses.id(req.params.addressId);
  if (!address) {
    res.status(404);
    throw new Error('Adresse introuvable');
  }
  const wasDefault = address.isDefault;
  address.deleteOne();

  // Never leave the customer with addresses but no default.
  if (wasDefault && req.user.adresses.length) req.user.adresses[0].isDefault = true;

  await req.user.save();
  res.json(req.user.toPublic());
});

// ── Favourites ──────────────────────────────────────────────────────────────

export const toggleFavourite = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const index = req.user.favoris.findIndex((f) => f.toString() === productId);

  if (index >= 0) req.user.favoris.splice(index, 1);
  else req.user.favoris.push(productId);

  await req.user.save();
  res.json({ favoris: req.user.favoris, isFavourite: index < 0 });
});

export const listFavourites = asyncHandler(async (req, res) => {
  await req.user.populate({ path: 'favoris', populate: { path: 'categoryId', select: 'nom slug' } });
  res.json(req.user.favoris);
});
