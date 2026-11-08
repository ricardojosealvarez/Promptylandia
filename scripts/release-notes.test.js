const test = require('node:test');
const assert = require('node:assert/strict');
const {CURRENT_VERSION, RELEASE_NOTES, getReleaseNotes} = require('./release-notes-1.18.0.js');

test('la versión actual coincide con la nota más reciente', () => {
  assert.equal(getReleaseNotes()[0].version, CURRENT_VERSION);
});

test('las notas se ordenan de la versión más reciente a la más antigua', () => {
  const versions = getReleaseNotes().map(({version}) => version);
  const parseVersion = (version) => {
    assert.match(version, /^\d+\.\d+\.\d+$/);
    return version.split('.').map(Number);
  };

  assert.ok(versions.length > 0);
  assert.equal(versions[0], CURRENT_VERSION);

  const parsedVersions = versions.map(parseVersion);
  for (let index = 1; index < parsedVersions.length; index += 1) {
    const [previousMajor, previousMinor, previousPatch] = parsedVersions[index - 1];
    const [currentMajor, currentMinor, currentPatch] = parsedVersions[index];
    const isDescending = previousMajor > currentMajor
      || (previousMajor === currentMajor && previousMinor > currentMinor)
      || (previousMajor === currentMajor && previousMinor === currentMinor && previousPatch >= currentPatch);

    assert.ok(isDescending, `${versions[index - 1]} debe preceder a ${versions[index]}`);
  }

  assert.equal(new Set(versions).size, versions.length, 'no debe haber versiones duplicadas');
});

test('cada versión tiene fecha ISO y al menos una mejora', () => {
  RELEASE_NOTES.forEach(({version, date, changes}) => {
    assert.match(version, /^\d+\.\d+\.\d+$/);
    assert.match(date, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(changes.length > 0);
  });
});
