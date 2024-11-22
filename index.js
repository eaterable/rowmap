// Use Symbols for internal storage
const VALUES = Symbol('values');
const ROW_INDEX = Symbol('rowIndex');

/**
 * Creates a dynamic row mapper class for mapping tabular data rows to objects.
 * @param {string[] | { headers: string[], index?: boolean, length?: boolean, className?: string }} options - The property names or a configuration object with headers.
 * @returns {Function} A dynamically named class for mapping rows or a mapping function.
 */
function createRowMapper(options) {
  if (!options) {
    throw new Error('Headers must be an array or provided in a configuration object.');
  }
  const { headers, className = 'RowMapper', index = true, length = true } = Array.isArray(options) ? { headers: options } : options;
  const hasIndexInHeaders = headers.includes('index');
  const hasLengthInHeaders = headers.includes('length');

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
      for (let i = 0; i < headers.length; i++) {
        obj[headers[i]] = this[VALUES][i];
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

  // Support
  Object.defineProperty(DynamicMapper.prototype, Symbol.toPrimitive, {
    value: function toPrimitive(hint) {
      return String(this[VALUES]);
    },
    enumerable: false,
  });

  // Add header-based getters and setters to the prototype
  headers.forEach(definePropertyForHeader, DynamicMapper.prototype);

  // Add "index" getter if needed
  if (index && !hasIndexInHeaders) {
    definePropertyForIndex(DynamicMapper.prototype);
  }

  // Add "length" getter if needed
  if (length && !hasLengthInHeaders) {
    definePropertyForLength(DynamicMapper.prototype);
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
function definePropertyForHeader(key, colIndex) {
  Object.defineProperty(this, key, {
    get: function getColumnValue() {
      return this[VALUES][colIndex];
    },
    set: function setColumnValue(value) {
      this[VALUES][colIndex] = value;
    },
    enumerable: true,
  });
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
  });
}

// Function to add the "length" property to the prototype
function definePropertyForLength(prototype) {
  Object.defineProperty(prototype, 'length', {
    get: function getLengthValue() {
      return this[VALUES].length;
    },
    set: function setLengthValue() {
      throw new Error('"length" is a read-only property when not part of the headers.');
    },
    enumerable: false,
  });
}

module.exports = createRowMapper;
