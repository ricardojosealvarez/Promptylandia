(function exposePromptNovelty(root, factory) {
  const api = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.PromptNovelty = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  const DAY_MS = 24 * 60 * 60 * 1000;

  const parseTimestamp = (value) => {
    const timestamp = value ? new Date(value).getTime() : NaN;
    return Number.isFinite(timestamp) ? timestamp : null;
  };

  const getCutoff = (days, now = Date.now()) =>
    new Date(now - days * DAY_MS).toISOString();

  const getStatus = (prompt, days, now = Date.now()) => {
    if (!prompt) return null;

    const cutoff = now - days * DAY_MS;
    const createdAt = parseTimestamp(prompt.created_at);
    const updatedAt = parseTimestamp(prompt.updated_at);

    if (
      updatedAt !== null &&
      updatedAt >= cutoff &&
      (createdAt === null || updatedAt > createdAt)
    ) {
      return 'updated';
    }

    return createdAt !== null && createdAt >= cutoff ? 'new' : null;
  };

  return { getCutoff, getStatus };
});
