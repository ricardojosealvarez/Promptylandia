(function exposeAuthSession(root, factory) {
  const api = factory();

  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AuthSession = api;
})(typeof window !== 'undefined' ? window : globalThis, () => {
  const isActive = (session, now = Date.now()) => {
    const expiresAt = Number(session?.expires_at) * 1000;
    return Boolean(session?.access_token) && Number.isFinite(expiresAt) && expiresAt > now;
  };

  const getExpiryDelay = (session, now = Date.now()) => {
    if (!isActive(session, now)) return 0;
    return Math.max(0, Number(session.expires_at) * 1000 - now);
  };

  return Object.freeze({getExpiryDelay, isActive});
});
