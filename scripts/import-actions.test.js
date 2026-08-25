const test = require('node:test');
const assert = require('node:assert/strict');
const {
  REQUIRED_COLUMNS,
  createImportPlan,
  getColumnMap,
  getMissingColumns,
} = require('./import-actions.js');

const baseRow = {
  ACCION: 'ALTA',
  CATEGORIA: 'Programación',
  SUBCATEGORIA: 'Desarrollo web',
  IA: 'ChatGPT',
  NOMBRE: 'Prompt nuevo',
  NOMBRE_ANTIGUO: '',
  NOMBRE_NUEVO: '',
  PROMPT: 'Contenido',
  NOTAS: 'Nota',
  PREMIUM: 'SI',
  CONTRIBUIDOR: 'Ada',
};

const existing = [
  {id: 7, nombre: 'Prompt anterior', categoria: 'Programación'},
  {id: 8, nombre: 'Otro prompt', categoria: 'Marketing'},
];

test('exige las columnas de control y nombres de actualización', () => {
  assert.deepEqual(getMissingColumns(getColumnMap({ACCION: '', PROMPT: ''})),
    REQUIRED_COLUMNS.filter((column) => !['ACCION', 'PROMPT'].includes(column)));
});

test('ALTA conserva el comportamiento habitual', () => {
  const plan = createImportPlan([baseRow], existing);

  assert.equal(plan.inserts.length, 1);
  assert.deepEqual(plan.inserts[0], {
    categoria: 'Programación',
    subcategoria: 'Desarrollo web',
    ia: 'CHATGPT',
    nombre: 'Prompt nuevo',
    prompt: 'Contenido',
    notas: 'Nota',
    premium: true,
    contribuidor: 'Ada',
  });
  assert.equal(plan.updates.length, 0);
  assert.deepEqual(plan.errors, []);
});

test('ACTUALIZACION localiza por NOMBRE_ANTIGUO y permite renombrar', () => {
  const row = {
    ...baseRow,
    ACCION: 'actualizacion',
    NOMBRE: '',
    NOMBRE_ANTIGUO: '  PROMPT ANTERIOR ',
    NOMBRE_NUEVO: 'Prompt renovado',
    PREMIUM: 'NO',
  };
  const plan = createImportPlan([row], existing);

  assert.equal(plan.updates.length, 1);
  assert.equal(plan.updates[0].id, 7);
  assert.equal(plan.updates[0].prompt.nombre, 'Prompt renovado');
  assert.equal(plan.updates[0].prompt.premium, false);
  assert.deepEqual(plan.errors, []);
});

test('ACTUALIZACION mantiene el nombre si NOMBRE_NUEVO está vacío', () => {
  const row = {
    ...baseRow,
    ACCION: 'ACTUALIZACION',
    NOMBRE: '',
    NOMBRE_ANTIGUO: 'Prompt anterior',
    NOMBRE_NUEVO: '',
  };
  const plan = createImportPlan([row], existing);

  assert.equal(plan.updates[0].prompt.nombre, 'Prompt anterior');
});

test('omite el contribuidor si la columna no existe para no borrar datos al actualizar', () => {
  const {CONTRIBUIDOR, ...rowWithoutContributor} = baseRow;
  const plan = createImportPlan([rowWithoutContributor], existing);

  assert.equal(Object.hasOwn(plan.inserts[0], 'contribuidor'), false);
});

test('rechaza acciones desconocidas y actualizaciones sin coincidencia única', () => {
  const invalidAction = {...baseRow, ACCION: 'BAJA'};
  const missing = {
    ...baseRow,
    ACCION: 'ACTUALIZACION',
    NOMBRE_ANTIGUO: 'Inexistente',
  };
  const duplicated = {
    ...baseRow,
    ACCION: 'ACTUALIZACION',
    NOMBRE_ANTIGUO: 'Repetido',
  };
  const plan = createImportPlan(
    [invalidAction, missing, duplicated],
    [
      ...existing,
      {id: 9, nombre: 'Repetido', categoria: 'Uno'},
      {id: 10, nombre: 'Repetido', categoria: 'Dos'},
    ],
  );

  assert.equal(plan.updates.length, 0);
  assert.match(plan.errors[0], /ACCION debe ser ALTA o ACTUALIZACION/);
  assert.match(plan.errors[1], /no existe el prompt/);
  assert.match(plan.errors[2], /hay varios prompts/);
});

test('evita actualizar dos veces el mismo prompt en un fichero', () => {
  const update = {
    ...baseRow,
    ACCION: 'ACTUALIZACION',
    NOMBRE_ANTIGUO: 'Prompt anterior',
    NOMBRE_NUEVO: '',
  };
  const plan = createImportPlan([update, update], existing);

  assert.equal(plan.updates.length, 1);
  assert.match(plan.errors[0], /ya se actualiza en otra fila/);
});
