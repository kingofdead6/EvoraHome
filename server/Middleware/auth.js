import jwt from 'jsonwebtoken';
import User from '../Models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const TOKEN_COOKIE = 'evora_session';

/**
 * The session token lives in an httpOnly cookie, not in localStorage. A token
 * in localStorage is readable by any script on the page, and logout can only
 * ever be advisory. With a cookie the server can actually end the session.
 */
export function signSession(res, user) {
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  res.cookie(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    // The storefront and API are on different hosts in production (Vercel and
    // Render), so the cookie has to survive a cross-site request.
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export function clearSession(res) {
  res.clearCookie(TOKEN_COOKIE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });
}

function readToken(req) {
  if (req.cookies?.[TOKEN_COOKIE]) return req.cookies[TOKEN_COOKIE];
  // Bearer is still accepted so the API stays usable from a script or curl.
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return null;
}

/** Attaches req.user when a valid session exists. Never rejects. */
export const attachUser = asyncHandler(async (req, res, next) => {
  const token = readToken(req);
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
  } catch {
    // Expired or tampered. Treated as a guest, which is a valid state
    // everywhere on this site except the admin.
  }
  return next();
});

/** Requires a logged-in customer. */
export const protect = (req, res, next) => {
  if (!req.user) {
    res.status(401);
    return next(new Error('Vous devez être connecté'));
  }
  return next();
};

/** Requires an admin. */
export const admin = (req, res, next) => {
  if (!req.user) {
    res.status(401);
    return next(new Error('Vous devez être connecté'));
  }
  if (req.user.role !== 'ADMIN') {
    res.status(403);
    return next(new Error('Accès réservé à l\'administration'));
  }
  return next();
};
