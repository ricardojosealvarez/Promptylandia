const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('Importar Excel usa un botón real que activa el selector de archivos', () => {
  assert.match(html, /<button[^>]+onclick="document\.querySelector\('#importFileInput'\)\.click\(\)"[^>]*>[^<]*Importar Excel<\/button>/);
  assert.match(html, /<input class="file-input" type="file" id="importFileInput"/);
  assert.doesNotMatch(html, /id="importFileInput"[^>]+display\s*:\s*none/);
});

test('la página carga el procesador de acciones del Excel', () => {
  assert.match(html, /<script src="scripts\/import-actions\.js(?:\?v=[^"]+)?"><\/script>/);
  assert.match(html, /PromptylandiaImportActions/);
  assert.match(html, /<span class="lbl">Actualizadas<\/span>/);
});
