(function exposePostgrestSearch(root, factory) {
  const api = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }

  root.PostgrestSearch = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, () => {
  const escapeIlikeTerm = (term) =>
    String(term)
      .replace(/\\/g, '\\\\\\\\')
      .replace(/"/g, '\\"')
      .replace(/%/g, '\\\\%')
      .replace(/_/g, '\\\\_');

  const buildIlikeClause = (column, term) =>
    `${column}.ilike."*${escapeIlikeTerm(term)}*"`;

  const buildSearchOrFilter = (nameTerms, promptTerms) => {
    const clauses = [
      ...nameTerms.map((term) => buildIlikeClause('nombre', term)),
      ...promptTerms.map((term) => buildIlikeClause('prompt', term)),
    ];

    return clauses.length ? `(${clauses.join(',')})` : '';
  };

  const appendSearchOrFilter = (path, nameTerms, promptTerms) => {
    const filter = buildSearchOrFilter(nameTerms, promptTerms);
    if (!filter) return path;

    const params = new URLSearchParams();
    params.set('or', filter);
    return `${path}${path.includes('?') ? '&' : '?'}${params.toString()}`;
  };

  return { appendSearchOrFilter, buildSearchOrFilter };
});
