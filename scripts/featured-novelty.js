(function exposeFeaturedNovelty(root, factory) {
  const api = factory();

  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.FeaturedNovelty = api;
})(typeof window !== 'undefined' ? window : globalThis, () => {
  const buildCandidateQuery = (cutoff = '') => {
    const recentFilter = cutoff ? `&updated_at=gte.${encodeURIComponent(cutoff)}` : '';
    return `prompts?select=id&premium=eq.true${recentFilter}&order=id.asc`;
  };

  const buildPromptQuery = (id) => `prompts?select=*&id=eq.${id}&limit=1`;

  const pickRandomIndex = (total, random = Math.random) => {
    if (!Number.isInteger(total) || total < 1) return -1;
    return Math.min(Math.floor(random() * total), total - 1);
  };

  return Object.freeze({buildCandidateQuery, buildPromptQuery, pickRandomIndex});
});
