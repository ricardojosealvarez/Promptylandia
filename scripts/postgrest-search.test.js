const assert = require('node:assert/strict');
const test = require('node:test');

const {
  appendSearchOrFilter,
  buildSearchOrFilter,
} = require('./postgrest-search.js');

const CASES = [
  {
    query: 'Juego de Piedra, Papel o Tijera',
    expected:
      '(nombre.ilike."*juego*",nombre.ilike."*de*",nombre.ilike."*piedra,*",nombre.ilike."*papel*",nombre.ilike."*o*",nombre.ilike."*tijera*")',
  },
  {
    query: 'punto.com',
    expected: '(nombre.ilike."*punto.com*")',
  },
  {
    query: 'clave: valor',
    expected: '(nombre.ilike."*clave:*",nombre.ilike."*valor*")',
  },
  {
    query: 'uno; dos',
    expected: '(nombre.ilike."*uno;*",nombre.ilike."*dos*")',
  },
  {
    query: 'guion-medio',
    expected: '(nombre.ilike."*guion-medio*")',
  },
  {
    query: 'guion_bajo',
    expected: '(nombre.ilike."*guion\\\\_bajo*")',
  },
];

const tokenize = (query) => query.toLowerCase().trim().split(/\s+/);

test('serializa búsquedas de título con puntuación como valores PostgREST', () => {
  CASES.forEach(({ query, expected }) => {
    const path = appendSearchOrFilter(
      'prompts?select=*',
      tokenize(query),
      [],
    );
    const url = new URL(`https://example.test/rest/v1/${path}`);

    assert.equal(url.searchParams.get('or'), expected, query);
  });
});

test('mantiene los filtros Premium y novedades al añadir la búsqueda', () => {
  const base =
    'prompts?select=*&premium=eq.true&updated_at=gte.2026-07-15T00%3A00%3A00.000Z';
  const path = appendSearchOrFilter(base, ['piedra,'], []);
  const url = new URL(`https://example.test/rest/v1/${path}`);

  assert.equal(url.searchParams.get('premium'), 'eq.true');
  assert.equal(
    url.searchParams.get('updated_at'),
    'gte.2026-07-15T00:00:00.000Z',
  );
  assert.equal(url.searchParams.get('or'), '(nombre.ilike."*piedra,*")');
});

test('escapa comillas, barras y comodines introducidos por el usuario', () => {
  assert.equal(
    buildSearchOrFilter(['a"b\\c_d%'], []),
    '(nombre.ilike."*a\\"b\\\\\\\\c\\\\_d\\\\%*")',
  );
});
