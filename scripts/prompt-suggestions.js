(function exposePromptSuggestions(root, factory) {
  const api = factory();

  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.PromptylandiaPromptSuggestions = api;
})(typeof window !== 'undefined' ? window : globalThis, () => {
  const EXPORT_COLUMNS = Object.freeze([
    'ID_LOTE',
    'ACCION',
    'NOMBRE_ANTIGUO',
    'NOMBRE_NUEVO',
    'CATEGORIA',
    'SUBCATEGORIA',
    'IA',
    'NOMBRE',
    'PROMPT',
    'NOTAS',
    'PREMIUM',
    'CONTRIBUIDOR',
  ]);

  const toExcelRows = (suggestions) => suggestions.map((suggestion) => ({
    ID_LOTE: '',
    ACCION: 'ALTA',
    NOMBRE_ANTIGUO: '',
    NOMBRE_NUEVO: '',
    CATEGORIA: suggestion.categoria || '',
    SUBCATEGORIA: suggestion.subcategoria || '',
    IA: suggestion.ia || '',
    NOMBRE: suggestion.nombre || '',
    PROMPT: suggestion.prompt || '',
    NOTAS: suggestion.notas || '',
    PREMIUM: suggestion.premium ? 'SI' : 'NO',
    CONTRIBUIDOR: suggestion.contribuidor || '',
  }));

  const getExportFilename = (date = new Date()) => {
    const day = date.toISOString().slice(0, 10);
    return `propuestas-prompts-${day}.xlsx`;
  };

  return Object.freeze({EXPORT_COLUMNS, getExportFilename, toExcelRows});
});
