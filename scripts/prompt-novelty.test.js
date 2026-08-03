const assert = require('node:assert/strict');
const test = require('node:test');

const { getCutoff, getStatus } = require('./prompt-novelty.js');

const NOW = Date.parse('2026-08-03T12:00:00.000Z');

test('calcula el periodo de novedades de 15 días', () => {
  assert.equal(getCutoff(15, NOW), '2026-07-19T12:00:00.000Z');
});

test('clasifica un alta reciente como nueva', () => {
  assert.equal(
    getStatus(
      {
        created_at: '2026-08-02T12:00:00.000Z',
        updated_at: '2026-08-02T12:00:00.000Z',
      },
      15,
      NOW,
    ),
    'new',
  );
});

test('clasifica un cambio reciente como actualización', () => {
  assert.equal(
    getStatus(
      {
        created_at: '2026-06-01T12:00:00.000Z',
        updated_at: '2026-08-01T12:00:00.000Z',
      },
      15,
      NOW,
    ),
    'updated',
  );
});

test('prioriza actualizado si el alta y el cambio están dentro del periodo', () => {
  assert.equal(
    getStatus(
      {
        created_at: '2026-07-30T12:00:00.000Z',
        updated_at: '2026-08-02T12:00:00.000Z',
      },
      15,
      NOW,
    ),
    'updated',
  );
});

test('omite altas y cambios anteriores al periodo', () => {
  assert.equal(
    getStatus(
      {
        created_at: '2026-06-01T12:00:00.000Z',
        updated_at: '2026-07-01T12:00:00.000Z',
      },
      15,
      NOW,
    ),
    null,
  );
});
