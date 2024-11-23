// Use Symbols for internal storage
const VALUES = Symbol('values');
const ROW_INDEX = Symbol('rowIndex');

/**
 * Creates a dynamic row mapper class for mapping tabular data rows to objects.
 * @param {string[] | { headers: string[], index?: boolean, array?: boolean, className?: string, preventCollisions?: boolean }} options - The property names or a configuration object with headers.
 * @returns {Function} A dynamically named class for mapping rows or a mapping function.
 */
function rowmap(options) {
  if (!options) {
    throw new Error('Headers must be an array or provided in a configuration object.');
  }
  const {
    headers,
    className = 'RowMapper',
    preventCollisions = false,
    index = true,
    array = true
  } = Array.isArray(options) ? { headers: options } : options;
  const uniqueHeaders = preventCollisions ? [...new Set(headers)] : headers;
  const hasIndexInHeaders = uniqueHeaders.includes('index');
  const hasArrayInHeaders = uniqueHeaders.includes('array');

  // Define the constructor function
  function DynamicMapper(values, rowIndex) {
    if (!(this instanceof DynamicMapper)) {
      return new DynamicMapper(values, rowIndex);
    }
    this[VALUES] = values;
    this[ROW_INDEX] = rowIndex;
  }

  // Add prototype methods
  Object.defineProperty(DynamicMapper.prototype, 'toJSON', {
    value: function toJSON() {
      const obj = {};
      for (const key of uniqueHeaders) {
        obj[key] = this[key];
      }
      return obj;
    },
    enumerable: false,
  });

  // Support array spread operator
  Object.defineProperty(DynamicMapper.prototype, Symbol.iterator, {
    value: function iterator() {
      return this[VALUES][Symbol.iterator]();
    },
    enumerable: false,
  });

  // Support primitive conversion
  Object.defineProperty(DynamicMapper.prototype, Symbol.toPrimitive, {
    value: function toPrimitive(hint) {
      return String(this[VALUES]);
    },
    enumerable: false,
  });

  // Add header-based getters and setters to the prototype
  headers.forEach(
    preventCollisions ? defineUniquePropertyForHeader : defineOverwritablePropertyForHeader,
    DynamicMapper.prototype
  );

  // Add "index" getter if needed
  if (index && !hasIndexInHeaders) {
    definePropertyForIndex(DynamicMapper.prototype);
  }

  // Add "array" getter if needed
  if (array && !hasArrayInHeaders) {
    definePropertyForArray(DynamicMapper.prototype);
  }

  // Add numeric indexing to prototype
  for (let i = 0; i < headers.length; i++) {
    Object.defineProperty(DynamicMapper.prototype, i, {
      get() { return this[VALUES][i]; },
      set(value) { this[VALUES][i] = value; },
      enumerable: false,
    });
  }

  // Define the class name
  Object.defineProperty(DynamicMapper, 'name', {
    value: className,
    configurable: true
  });

  return DynamicMapper;
}

// Function to add properties to the prototype for headers
function definePropertyForHeader(target, key, colIndex, configurable) {
  Object.defineProperty(target, key, {
    get: function getColumnValue() {
      return this[VALUES][colIndex];
    },
    set: function setColumnValue(value) {
      this[VALUES][colIndex] = value;
    },
    enumerable: true,
    configurable,
  });
}

// Function to add overwritable properties to the prototype for headers
function defineOverwritablePropertyForHeader(key, colIndex) {
  definePropertyForHeader(this, key, colIndex, true);
}

// Function to add unique properties to the prototype for headers
function defineUniquePropertyForHeader(key, colIndex) {
  if (!Reflect.has(this, key)) {
    definePropertyForHeader(this, key, colIndex, false);
  }
}

// Function to add the "index" property to the prototype
function definePropertyForIndex(prototype) {
  Object.defineProperty(prototype, 'index', {
    get: function getIndexValue() {
      return this[ROW_INDEX];
    },
    set: function setIndexValue() {
      throw new Error('"index" is a read-only property when not part of the headers.');
    },
    enumerable: false,
    configurable: true,
  });
}

// Function to add the "array" property to the prototype
function definePropertyForArray(prototype) {
  Object.defineProperty(prototype, 'array', {
    get: function getArrayValue() {
      return this[VALUES];
    },
    set: function setArrayValue() {
      throw new Error('"array" is a read-only property when not part of the headers.');
    },
    enumerable: false,
    configurable: true,
  });
}

module.exports = rowmap;
