const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const {getExpiryDelay, isActive} = require('./auth-session.js');

const NOW = Date.parse('2026-08-09T12:00:00.000Z');

test('considera activa una sesión con token y vencimiento futuro', () => {
  const session = {access_token: 'token', expires_at: NOW / 1000 + 60};

  assert.equal(isActive(session, NOW), true);
  assert.equal(getExpiryDelay(session, NOW), 60000);
});

test('considera expirada una sesión al alcanzar su vencimiento', () => {
  const session = {access_token: 'token', expires_at: NOW / 1000};

  assert.equal(isActive(session, NOW), false);
  assert.equal(getExpiryDelay(session, NOW), 0);
});

test('rechaza sesiones incompletas', () => {
  assert.equal(isActive(null, NOW), false);
  assert.equal(isActive({expires_at: NOW / 1000 + 60}, NOW), false);
  assert.equal(isActive({access_token: 'token'}, NOW), false);
});

test('la página programa el vencimiento y bloquea interacciones expiradas', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

  assert.match(html, /scheduleAuthExpiry\(\);/);
  assert.match(html, /setTimeout\(expireAuthSession,AuthSession\.getExpiryDelay\(authSession\)\)/);
  assert.match(html, /document\.addEventListener\('pointerdown',blockExpiredInteraction,true\)/);
  assert.match(html, /La sesión ha expirado\. Introduce tus credenciales de nuevo\./);
});
