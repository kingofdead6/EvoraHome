/**
 * Boots the API without a database and checks the paths that must never reach
 * Mongo: input validation, auth guards, CORS, the 404 handler and the French
 * error shape.
 *
 *   node seed/smoke.js
 *
 * This is not a substitute for an integration test against a real database. It
 * exists because those parts are the ones that silently rot, and because the
 * error handler is what the customer actually reads when something goes wrong.
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'smoke-test-secret';
process.env.CLIENT_ORIGINS = 'https://evora-home-jade.vercel.app';

const { createApp } = await import('../app.js');

const app = createApp({ rateLimits: false });
const server = app.listen(0);
await new Promise((resolve) => server.once('listening', resolve));
const base = `http://127.0.0.1:${server.address().port}`;

let failures = 0;
const fail = (msg) => {
  failures += 1;
  console.error(`  FAIL  ${msg}`);
};
const ok = (msg) => console.log(`  ok    ${msg}`);

async function check(label, { method = 'GET', path, body, headers }, expectStatus, expectText) {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body && method !== 'GET' ? JSON.stringify(body) : undefined,
  });

  let payload;
  try {
    payload = await res.json();
  } catch {
    payload = {};
  }

  if (res.status !== expectStatus) {
    return fail(`${label}: statut ${res.status}, attendu ${expectStatus} (${payload.message || ''})`);
  }
  if (expectText && !String(payload.message || '').includes(expectText)) {
    return fail(`${label}: message "${payload.message}" ne contient pas "${expectText}"`);
  }
  return ok(`${label} -> ${res.status}`);
}

console.log('\nSanté');
await check('health', { path: '/api/health' }, 200);

console.log('\n404');
await check('route inconnue', { path: '/api/nope' }, 404, 'introuvable');

console.log('\nValidation inscription');
await check(
  'nom manquant',
  { method: 'POST', path: '/api/auth/register', body: { telephone: '0540870382', password: 'secret123' } },
  400,
  'nom'
);
await check(
  'téléphone invalide',
  { method: 'POST', path: '/api/auth/register', body: { nom: 'Test', telephone: '12345', password: 'secret123' } },
  400,
  'téléphone'
);
await check(
  'mot de passe trop court',
  { method: 'POST', path: '/api/auth/register', body: { nom: 'Test', telephone: '0540870382', password: 'abc' } },
  400,
  'mot de passe'
);
await check(
  'identifiants manquants',
  { method: 'POST', path: '/api/auth/login', body: {} },
  400,
  'requis'
);

console.log('\nValidation commande');
await check(
  'panier vide',
  {
    method: 'POST',
    path: '/api/orders',
    body: { clientNom: 'Test', clientTelephone: '0540870382', items: [], modeLivraison: 'DOMICILE' },
  },
  400,
  'panier'
);
await check(
  'téléphone invalide',
  {
    method: 'POST',
    path: '/api/orders',
    body: { clientNom: 'Test', clientTelephone: 'abc', items: [{ productId: 'x' }], modeLivraison: 'DOMICILE' },
  },
  400,
  'téléphone'
);
await check(
  'mode de livraison invalide',
  {
    method: 'POST',
    path: '/api/orders',
    body: {
      clientNom: 'Test',
      clientTelephone: '0540870382',
      items: [{ productId: 'x' }],
      modeLivraison: 'DRONE',
    },
  },
  400,
  'livraison'
);
await check(
  'recherche de commande sans téléphone',
  { path: '/api/orders/lookup?numero=EVH-2026-0001' },
  400,
  'requis'
);

console.log('\nValidation message');
await check(
  'message vide',
  { method: 'POST', path: '/api/messages', body: { nom: 'Test', telephone: '0540870382', message: '' } },
  400,
  'message'
);

console.log('\nGardes admin');
for (const [label, path, method] of [
  ['dashboard', '/api/admin/dashboard', 'GET'],
  ['produits', '/api/admin/products', 'GET'],
  ['commandes', '/api/admin/orders', 'GET'],
  ['réglages', '/api/admin/settings', 'PUT'],
  ['wilayas', '/api/admin/wilayas/bulk', 'PUT'],
]) {
  await check(`admin ${label} sans session`, { method, path, body: {} }, 401, 'connecté');
}

console.log('\nGardes client');
for (const [label, path] of [
  ['mes commandes', '/api/orders/mine'],
  ['mes favoris', '/api/auth/favoris'],
]) {
  await check(`${label} sans session`, { path }, 401, 'connecté');
}

console.log('\nSession anonyme');
await check('me sans session renvoie null', { path: '/api/auth/me' }, 200);
const meRes = await fetch(`${base}/api/auth/me`);
if ((await meRes.json()) !== null) fail('/api/auth/me devrait renvoyer null pour un invité');
else ok('/api/auth/me renvoie null');

console.log('\nCORS');
const badOrigin = await fetch(`${base}/api/health`, { headers: { Origin: 'https://evil.example' } });
if (badOrigin.status !== 500) fail(`origine non autorisée: statut ${badOrigin.status}, attendu 500`);
else ok('origine non autorisée rejetée');

const goodOrigin = await fetch(`${base}/api/health`, { headers: { Origin: 'http://localhost:5173' } });
if (goodOrigin.headers.get('access-control-allow-credentials') !== 'true') {
  fail('credentials CORS non activés pour une origine autorisée');
} else ok('origine autorisée acceptée avec credentials');

server.close();
console.log(failures === 0 ? '\nAPI conforme.\n' : `\n${failures} problème(s) détecté(s).\n`);
process.exit(failures === 0 ? 0 : 1);
