import test from 'node:test';
import assert from 'node:assert/strict';
import createRowMapper from './index.js';

test('RowMap', async (t) => {
  await t.test('Supports both function and class instantiation', () => {
    const Row = createRowMapper(['id', 'name', 'email']);

    // Test function instantiation
    const row1 = Row([1, 'Alice', 'alice@example.com']);
    assert.equal(row1.id, 1);
    assert.equal(row1.name, 'Alice');
    assert.equal(row1.email, 'alice@example.com');

    // Test class instantiation
    const row2 = new Row([2, 'Bob', 'bob@example.com']);
    assert.equal(row2.id, 2);
    assert.equal(row2.name, 'Bob');
    assert.equal(row2.email, 'bob@example.com');
  });

  await t.test('Supports Object.keys() for all header types', () => {
    const Row1 = createRowMapper(['id', 'name', 'email']);
    assert.deepEqual(Object.keys(Row1.prototype), ['id', 'name', 'email']);

    const Row2 = createRowMapper(['id', 'name', 'index', 'length']);
    assert.deepEqual(Object.keys(Row2.prototype), ['id', 'name', 'index', 'length']);
  });

  await t.test('Handles index property configuration', () => {
    // Test default behavior
    const Row1 = createRowMapper(['id', 'name']);
    const row1 = Row1([1, 'Alice'], 0);
    assert.equal(row1.index, 0);

    // Test disabled index
    const Row2 = createRowMapper({ headers: ['id', 'name'], index: false });
    const row2 = Row2([2, 'Bob'], 1);
    assert.equal(row2.index, undefined);
  });

  await t.test('Supports JSON serialization and conversion', () => {
    const Row = createRowMapper(['id', 'name', 'email']);
    const row = new Row([1, 'Alice', 'alice@example.com']);

    // Test toJSON
    assert.deepEqual(row.toJSON(), {
      id: 1,
      name: 'Alice',
      email: 'alice@example.com'
    });

    // Test JSON.stringify/parse
    const parsed = JSON.parse(JSON.stringify(row));
    assert.deepEqual(parsed, {
      id: 1,
      name: 'Alice',
      email: 'alice@example.com'
    });
  });

  await t.test('Handles empty rows gracefully', () => {
    const Row = createRowMapper(['id', 'name', 'email']);
    const row = new Row([]);

    assert.equal(row.id, undefined);
    assert.equal(row.name, undefined);
    assert.equal(row.email, undefined);
    assert.equal(row.length, 0);
  });

  await t.test('Throws error when no headers provided', () => {
    assert.throws(
      () => createRowMapper(),
      /Headers must be an array or provided in a configuration object/
    );

    assert.throws(
      () => createRowMapper(null),
      /Headers must be an array or provided in a configuration object/
    );
  });

  await t.test('Supports property mutation', () => {
    const Row = createRowMapper(['id', 'name', 'email']);
    const row = new Row([1, 'Alice', 'alice@example.com']);

    row.name = 'Alicia';
    row.email = 'alicia@example.com';

    assert.equal(row.name, 'Alicia');
    assert.equal(row.email, 'alicia@example.com');

    // Verify internal array is updated
    assert.deepEqual([...row], [1, 'Alicia', 'alicia@example.com']);
  });

  await t.test('Handles read-only properties correctly', () => {
    const Row = createRowMapper(['id', 'name']);
    const row = Row([1, 'Alice'], 5);

    // Index should be read-only when not in headers
    assert.throws(
      () => { row.index = 10; },
      /\"index\" is a read-only property/
    );

    // Length should be read-only when not in headers
    assert.throws(
      () => { row.length = 10; },
      /\"length\" is a read-only property/
    );
  });

  await t.test('Supports custom class names', () => {
    const CustomRow = createRowMapper({
      headers: ['id', 'name'],
      className: 'CustomRowMapper'
    });

    assert.equal(CustomRow.name, 'CustomRowMapper');
    const row = new CustomRow([1, 'Alice']);
    assert(row instanceof CustomRow);
  });

  await t.test('Handles primitive type conversion correctly', () => {
    const Row = createRowMapper(['id', 'name']);
    const row = new Row([1, 'Alice']);

    // Test String conversion
    assert.equal(String(row), '1,Alice');

    // Test concatenation
    assert.equal('Row: ' + row, 'Row: 1,Alice');
  });

  await t.test('Preserves array-like behavior', () => {
    const Row = createRowMapper(['id', 'name', 'email']);
    const values = [1, 'Alice', 'alice@example.com'];
    const row = new Row(values);

    // Test spread operator
    assert.deepEqual([...row], values);

    // Test length property
    assert.equal(row.length, values.length);

    // Test Array.from
    assert.deepEqual(Array.from(row), values);
  });

  await t.test('Supports headers with special names', () => {
    const Row = createRowMapper(['constructor', 'toString', 'valueOf']);
    const row = new Row(['ctor', 'str', 'val']);

    assert.equal(row.constructor, 'ctor');
    assert.equal(row.toString, 'str');
    assert.equal(row.valueOf, 'val');
  });

  await t.test('Handles index and length as headers', () => {
    const Row = createRowMapper(['id', 'index', 'length']);
    const values = [1, 2, 3];
    const row = new Row(values, 0);

    // When 'index' is in headers, it should be treated as regular column
    assert.equal(row.index, 2);
    assert.equal(row.length, 3);

    // Should be mutable
    row.index = 5;
    assert.equal(row.index, 5);
    row.length = 10;
    assert.equal(row.length, 10);
  });

  await t.test('Supports numeric index access for getting values', () => {
    const Row = createRowMapper(['id', 'name', 'email']);
    const values = [1, 'Alice', 'alice@example.com'];
    const row = new Row(values);

    // Test accessing values using numeric indices
    assert.equal(row[0], 1);
    assert.equal(row[1], 'Alice');
    assert.equal(row[2], 'alice@example.com');

    // Test accessing out of bounds index
    assert.equal(row[3], undefined);
  });

  await t.test('Supports numeric index access for setting values', () => {
    const Row = createRowMapper(['id', 'name', 'email']);
    const row = new Row([1, 'Alice', 'alice@example.com']);

    // Test setting values using numeric indices
    row[0] = 2;
    row[1] = 'Bob';
    row[2] = 'bob@example.com';

    // Verify values were updated both through numeric and named access
    assert.equal(row[0], 2);
    assert.equal(row.id, 2);
    assert.equal(row[1], 'Bob');
    assert.equal(row.name, 'Bob');
    assert.equal(row[2], 'bob@example.com');
    assert.equal(row.email, 'bob@example.com');
  });
});
