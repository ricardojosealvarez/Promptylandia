const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {EXPORT_COLUMNS, getExportFilename, toExcelRows} = require('./prompt-suggestions.js');

test('exporta propuestas con la estructura de carga y el contribuidor', () => {
  const [row] = toExcelRows([{
    categoria: 'Programación',
    subcategoria: 'Desarrollo web',
    ia: 'CHATGPT',
    nombre: 'Prompt propuesto',
    prompt: 'Contenido',
    notas: 'Revisar',
    premium: true,
    contribuidor: 'Ada',
  }]);

  assert.deepEqual(Object.keys(row), EXPORT_COLUMNS);
  assert.equal(row.ACCION, 'ALTA');
  assert.equal(row.PREMIUM, 'SI');
  assert.equal(row.CONTRIBUIDOR, 'Ada');
});

test('genera un nombre de fichero estable por fecha', () => {
  assert.equal(getExportFilename(new Date('2026-08-25T19:00:00Z')), 'propuestas-prompts-2026-08-25.xlsx');
});

test('la interfaz conecta captura y extracción con el proxy', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const proxy = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'functions', 'prompts-proxy', 'index.ts'), 'utf8');
  const migration = fs.readFileSync(
    path.join(__dirname, '..', 'supabase', 'migrations', '20260825173945_add_prompt_suggestions.sql'),
    'utf8',
  );
  const exportFix = fs.readFileSync(
    path.join(__dirname, '..', 'supabase', 'migrations', '20260825163310_fix_prompt_suggestion_export_delete.sql'),
    'utf8',
  );

  assert.match(html, /openSuggestionModal\(\)/);
  assert.match(html, /action:'createPromptSuggestion'/);
  assert.match(html, /action:'extractPromptSuggestions'/);
  assert.match(html, /id="suggestionsStatus"/);
  assert.match(html, /action:'getPromptSuggestionsStatus'/);
  assert.match(proxy, /case 'extractPromptSuggestions'/);
  assert.match(proxy, /case 'getPromptSuggestionsStatus'/);
  assert.match(proxy, /payload\.action === 'createPromptSuggestion'/);
  assert.match(migration, /alter table public\.prompt_suggestions enable row level security/i);
  assert.match(migration, /delete from public\.prompt_suggestions/i);
  assert.match(migration, /grant execute on function public\.extract_prompt_suggestions\(\) to service_role/i);
  assert.match(exportFix, /delete from public\.prompt_suggestions\s+where true/i);
});
