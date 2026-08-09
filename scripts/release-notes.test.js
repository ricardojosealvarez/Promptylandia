const test = require('node:test');
const assert = require('node:assert/strict');
const {CURRENT_VERSION, RELEASE_NOTES, getReleaseNotes} = require('./release-notes-1.14.3.js');

test('la versión actual coincide con la nota más reciente', () => {
  assert.equal(getReleaseNotes()[0].version, CURRENT_VERSION);
});

test('las notas se ordenan de la versión más reciente a la más antigua', () => {
  const versions = getReleaseNotes().map(({version}) => version);

  assert.deepEqual(versions.slice(0, 4), ['1.14.3', '1.14.2', '1.14.1', '1.14.0']);
});

test('cada versión tiene fecha ISO y al menos una mejora', () => {
  RELEASE_NOTES.forEach(({version, date, changes}) => {
    assert.match(version, /^\d+\.\d+\.\d+$/);
    assert.match(date, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(changes.length > 0);
  });
});
