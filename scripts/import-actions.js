(function exposeImportActions(root, factory) {
  const api = factory();

  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.PromptylandiaImportActions = api;
})(typeof window !== 'undefined' ? window : globalThis, () => {
  const REQUIRED_COLUMNS = Object.freeze([
    'ACCION',
    'CATEGORIA',
    'SUBCATEGORIA',
    'IA',
    'NOMBRE',
    'NOMBRE_ANTIGUO',
    'NOMBRE_NUEVO',
    'PROMPT',
  ]);

  const normalizeKey = (value) => String(value || '').trim().normalize('NFC').toLowerCase();

  const parsePremium = (value) => {
    const normalized = String(value || '').trim().toUpperCase();
    if (['SI', 'SÍ', 'YES', 'TRUE', '1'].includes(normalized)) return true;
    if (!normalized || ['NO', 'FALSE', '0'].includes(normalized)) return false;
    throw new Error('PREMIUM debe ser SI o NO');
  };

  const getColumnMap = (row) => {
    const columnMap = {};
    Object.keys(row || {}).forEach((column) => {
      columnMap[column.trim().toUpperCase()] = column;
    });
    return columnMap;
  };

  const getMissingColumns = (columnMap) =>
    REQUIRED_COLUMNS.filter((column) => !columnMap[column]);

  const getPromptData = (row, columnMap, name) => ({
    categoria: String(row[columnMap.CATEGORIA] || '').trim(),
    subcategoria: String(row[columnMap.SUBCATEGORIA] || '').trim(),
    ia: String(row[columnMap.IA] || '').trim().toUpperCase(),
    nombre: name,
    prompt: String(row[columnMap.PROMPT] || '').trim(),
    notas: columnMap.NOTAS ? String(row[columnMap.NOTAS] || '').trim() : '',
    premium: columnMap.PREMIUM ? parsePremium(row[columnMap.PREMIUM]) : false,
  });

  const hasEmptyRequiredValue = (prompt) =>
    !prompt.categoria || !prompt.subcategoria || !prompt.ia || !prompt.nombre || !prompt.prompt;

  /** Construye operaciones de alta y actualización sin modificar datos. */
  const createImportPlan = (rows, existingPrompts, columnMap = getColumnMap(rows[0])) => {
    const inserts = [];
    const updates = [];
    const skipped = [];
    const errors = [];
    const promptsByName = new Map();
    const idsByKey = new Map();
    const updatedIds = new Set();

    existingPrompts.forEach((prompt) => {
      const nameKey = normalizeKey(prompt.nombre);
      const promptKey = `${nameKey}||${normalizeKey(prompt.categoria)}`;
      const matches = promptsByName.get(nameKey) || [];
      matches.push(prompt);
      promptsByName.set(nameKey, matches);
      idsByKey.set(promptKey, prompt.id);
    });

    rows.forEach((row, index) => {
      const rowNumber = index + 2;
      const action = String(row[columnMap.ACCION] || '').trim().toUpperCase();

      if (!['ALTA', 'ACTUALIZACION'].includes(action)) {
        errors.push(`Fila ${rowNumber}: ACCION debe ser ALTA o ACTUALIZACION`);
        return;
      }

      try {
        if (action === 'ALTA') {
          const name = String(row[columnMap.NOMBRE] || '').trim();
          const prompt = getPromptData(row, columnMap, name);
          if (hasEmptyRequiredValue(prompt)) {
            errors.push(`Fila ${rowNumber}: campos obligatorios vacíos para ALTA`);
            return;
          }

          const promptKey = `${normalizeKey(prompt.nombre)}||${normalizeKey(prompt.categoria)}`;
          if (idsByKey.has(promptKey)) {
            skipped.push(`Fila ${rowNumber}: "${prompt.nombre}" / ${prompt.categoria}`);
            return;
          }

          idsByKey.set(promptKey, null);
          inserts.push(prompt);
          return;
        }

        const oldName = String(row[columnMap.NOMBRE_ANTIGUO] || '').trim();
        const newName = String(row[columnMap.NOMBRE_NUEVO] || '').trim() || oldName;
        if (!oldName) {
          errors.push(`Fila ${rowNumber}: NOMBRE_ANTIGUO está vacío`);
          return;
        }

        const matches = promptsByName.get(normalizeKey(oldName)) || [];
        if (matches.length === 0) {
          errors.push(`Fila ${rowNumber}: no existe el prompt "${oldName}"`);
          return;
        }
        if (matches.length > 1) {
          errors.push(`Fila ${rowNumber}: hay varios prompts llamados "${oldName}"`);
          return;
        }

        const target = matches[0];
        if (updatedIds.has(target.id)) {
          errors.push(`Fila ${rowNumber}: el prompt "${oldName}" ya se actualiza en otra fila`);
          return;
        }

        const prompt = getPromptData(row, columnMap, newName);
        if (hasEmptyRequiredValue(prompt)) {
          errors.push(`Fila ${rowNumber}: campos obligatorios vacíos para ACTUALIZACION`);
          return;
        }

        const oldKey = `${normalizeKey(target.nombre)}||${normalizeKey(target.categoria)}`;
        const newKey = `${normalizeKey(prompt.nombre)}||${normalizeKey(prompt.categoria)}`;
        const conflictingId = idsByKey.get(newKey);
        if (conflictingId !== undefined && conflictingId !== target.id) {
          errors.push(`Fila ${rowNumber}: ya existe "${prompt.nombre}" / ${prompt.categoria}`);
          return;
        }

        idsByKey.delete(oldKey);
        idsByKey.set(newKey, target.id);
        updatedIds.add(target.id);
        updates.push({id: target.id, rowNumber, oldName, prompt});
      } catch (error) {
        errors.push(`Fila ${rowNumber}: ${error.message}`);
      }
    });

    return {inserts, updates, skipped, errors};
  };

  return Object.freeze({REQUIRED_COLUMNS, createImportPlan, getColumnMap, getMissingColumns});
});
