# RowMap

Effortlessly map tabular data (like CSV rows) to objects using lightweight dynamic mappers.
**RowMap** is designed to be **minimal**, **elegant**, and **developer-friendly**, making it a powerful tool for working with structured data in JavaScript or TypeScript.

## 🌟 Features

- **Flexible Mapper Behavior**: Use it as a **class** or a **function**—the choice is yours.
- **Header-Based Mapping**: Map rows to meaningful property names using headers or configuration objects.
- **Dynamic Properties**: Access and modify array values through descriptive property names.
- **Array-Like**: Access `length` and iterate like a regular array.
- **Iterable Support**: Fully compatible with JavaScript's iterable protocol (`for...of`, spread syntax).
- **Serialization Ready**: Automatically serializable with `JSON.stringify` or a `toJSON()` method.
- **Minimal API**: Simple, efficient, and developer-friendly.

## 🚀 Installation

Install using npm:

```bash
npm install @eaterable/rowmap
```

## ✨ Usage

The `rowmap` function provides a **universal mapper** that can function as both a class and a direct function, depending on how you use it. It works seamlessly to map rows to objects with descriptive properties.

### Universal Mapper Example

```typescript
import rowmap from '@eaterable/rowmap';

// Example data
const [headers, ...rows] = [
  ['id', 'name', 'email'], // Header row
  [1, 'Alice', 'alice@example.com'],
  [2, 'Bob', 'bob@example.com'],
];

// Create a universal mapper using headers
const User = rowmap(['id', 'name', 'email']);

// Map rows directly to objects
const objects = rows.map(User);

console.log(objects);
// Output:
// [
//   { id: 1, name: 'Alice', email: 'alice@example.com' },
//   { id: 2, name: 'Bob', email: 'bob@example.com' },
// ]

// Or use it as a class
const obj = new Row([3, 'Charlie', 'charlie@example.com']);
console.log(obj);
// Output: { id: 3, name: 'Charlie', email: 'charlie@example.com' }
```

### Configuration Options

```typescript
const Row = rowmap({
  headers: ['id', 'name', 'email'],  // Required: column names
  index: false,                      // Optional: disable row index (default: true)
  className: 'User'                  // Optional: custom class name
});
```

### Property Access and Modification

```typescript
const row = new Row([1, 'Alice', 'alice@example.com']);

// Read values
console.log(row[0]);  // 'Alice'
console.log(row.name);  // 'Alice'
console.log(row.length);  // 3 (number of columns)

// Modify values
row.name = 'Alicia';
console.log([...row]);  // [1, 'Alicia', 'alice@example.com']

// Note: 'length' can be used as a header name if needed
const CustomRow = rowmap(['id', 'name', 'length']);
```

### Iteration and Conversion

```typescript
// Spread syntax
const values = [...row];

// Convert to string
console.log(String(row));  // '1,Alicia,alice@example.com'

// Convert to object
console.log(row.toJSON());

// JSON serialization
console.log(JSON.stringify(row));
```

## 💡 Why Use RowMap?

- **Universal Design**: Whether you prefer functional programming or object-oriented patterns, RowMap fits your style.
- **Readable**: Transform tabular data into meaningful structures with minimal effort.
- **Lightweight**: Designed to do one job and do it well.
- **Developer-Friendly**: Works seamlessly with native JavaScript features like iteration, JSON serialization, and dynamic properties.

## 🤝 Contributing

We welcome contributions! Feel free to fork the repository, submit pull requests, or open issues.

## 🛡 License

This project is licensed under the MIT License.

---

Ready to map your tabular data effortlessly? **Try RowMap today!** 🎉
