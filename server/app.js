import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import routes from './Routes/index.js';
import { attachUser } from './Middleware/auth.js';
import { notFound, errorHandler } from './Middleware/error.js';

/**
 * Builds the Express app. Kept separate from index.js so it can be booted in a
 * test without opening a database connection or binding a port.
 */
export function createApp({ rateLimits = true } = {}) {
  const app = express();

  // Render and most hosts sit behind a proxy. Without this, rate limiting sees
  // every request as coming from the same address and secure cookies are dropped.
  app.set('trust proxy', 1);

  /**
   * Credentialed CORS cannot use a wildcard origin, and the session cookie is
   * useless without credentials, so the allowed origins are explicit.
   */
  const allowedOrigins = [
    'http://localhost:5173',
    'https://evora-home-jade.vercel.app',
  ];

  app.use(
    cors({
      origin(origin, callback) {
        // Same-origin requests and curl send no Origin header.
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`Origine non autorisée: ${origin}`));
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());
  app.use('/products', express.static('public/products'));

  if (rateLimits) {
    // Login and register are the only endpoints worth guessing at.
    app.use(
      ['/api/auth/login', '/api/auth/register'],
      rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 20,
        standardHeaders: true,
        legacyHeaders: false,
        message: { message: 'Trop de tentatives. Réessayez dans quelques minutes.' },
      })
    );

    // Order creation, so a script cannot fill the admin with junk.
    app.use(
      '/api/orders',
      rateLimit({
        windowMs: 60 * 60 * 1000,
        limit: 30,
        standardHeaders: true,
        legacyHeaders: false,
        skip: (req) => req.method === 'GET',
        message: { message: 'Trop de commandes envoyées. Contactez-nous par téléphone.' },
      })
    );
  }

  app.get('/api/health', (req, res) => {
    res.json({ ok: true, db: mongoose.connection.readyState === 1 });
  });

  app.use('/api', attachUser, routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

export default createApp;
