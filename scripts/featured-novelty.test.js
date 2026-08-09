const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const {buildCandidateQuery, buildPromptQuery, pickRandomIndex} = require('./featured-novelty.js');

test('filtra únicamente prompts premium nuevos o actualizados', () => {
  const query = buildCandidateQuery('2026-07-25T10:00:00.000Z');
  const url = new URL(`https://example.com/${query}`);

  assert.equal(url.searchParams.get('premium'), 'eq.true');
  assert.equal(url.searchParams.get('updated_at'), 'gte.2026-07-25T10:00:00.000Z');
  assert.equal(url.searchParams.get('select'), 'id');
  assert.equal(url.searchParams.get('order'), 'id.asc');
});

test('permite seleccionar cualquier prompt premium como alternativa', () => {
  const url = new URL(`https://example.com/${buildCandidateQuery()}`);

  assert.equal(url.searchParams.get('premium'), 'eq.true');
  assert.equal(url.searchParams.has('updated_at'), false);
});

test('consulta únicamente el prompt seleccionado', () => {
  const url = new URL(`https://example.com/${buildPromptQuery(42)}`);

  assert.equal(url.searchParams.get('id'), 'eq.42');
  assert.equal(url.searchParams.get('limit'), '1');
});

test('elige un índice aleatorio dentro del total disponible', () => {
  assert.equal(pickRandomIndex(5, () => 0), 0);
  assert.equal(pickRandomIndex(5, () => 0.6), 3);
  assert.equal(pickRandomIndex(5, () => 1), 4);
});

test('no elige un índice cuando no hay novedades', () => {
  assert.equal(pickRandomIndex(0), -1);
  assert.equal(pickRandomIndex(-1), -1);
});

test('carga una novedad al acceder a la pestaña de búsqueda', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

  assert.match(html, /<script src="scripts\/featured-novelty\.js\?v=1\.14\.3"><\/script>/);
  assert.match(html, /<h2 id="featuredNoveltyTitle">Novedades destacadas<\/h2>/);
  assert.match(html, /if\(tab==='search'\) loadFeaturedNovelty\(\);/);
  assert.match(html, /title\.textContent='Prompt Destacado'/);
});
