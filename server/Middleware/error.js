/**
 * All error responses are French: they are shown directly to the customer.
 * Stack traces are never sent in production.
 */
export function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route introuvable: ${req.originalUrl}`));
}

export function errorHandler(err, req, res, _next) {
  let status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Une erreur est survenue';

  // Mongoose validation: surface the field messages, which are already French.
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join('. ');
  }

  // Duplicate key. The only unique fields a customer can collide on are the
  // phone number and, in the admin, a product reference.
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyPattern || {})[0];
    message =
      field === 'telephone'
        ? 'Ce numéro de téléphone est déjà utilisé'
        : field === 'ref'
          ? 'Cette référence produit existe déjà'
          : 'Cette valeur existe déjà';
  }

  if (err.name === 'CastError') {
    status = 400;
    message = 'Identifiant invalide';
  }

  if (status >= 500) console.error(err);

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === 'production' ? {} : { stack: err.stack }),
  });
}
