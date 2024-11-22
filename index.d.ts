/**
 * Configuration options for creating a row mapper
 */
export interface RowMapperOptions<T extends Record<string, any>> {
  /** Array of column headers that match the properties of type T */
  headers: (keyof T)[];
  /** Custom name for the generated class (default: 'RowMapper') */
  className?: string;
  /** Whether to include the row index property (default: true) */
  index?: boolean;
  /** Whether to include the length property (default: true) */
  length?: boolean;
}

/**
 * Additional properties added to every row instance
 */
export interface RowInstance<T> extends Iterable<any> {
  /** Converts the row to a plain object */
  toJSON(): T;
  /** The zero-based index of this row in the dataset (if enabled) */
  readonly index?: number;
  /** The number of columns in the row */
  readonly length: number;
  /** Access values by numeric index */
  [index: number]: any;
}

/**
 * The generated row mapper class type
 */
interface RowMapperClass<T extends Record<string, any>> {
  /** Create a new row instance using constructor syntax */
  new (values: any[], rowIndex?: number): T & RowInstance<T>;
  /** Create a new row instance using function syntax */
  (values: any[], rowIndex?: number): T & RowInstance<T>;
  /** The name of the class */
  readonly name: string;
  /** The prototype containing the property descriptors */
  readonly prototype: T;
}

/**
 * Creates a row mapper class for mapping tabular data rows to objects.
 *
 * @example
 * ```ts
 * interface UserRow {
 *   id: number;
 *   name: string;
 *   email: string;
 * }
 *
 * // Using array syntax
 * const UserMapper = rowmapper<UserRow>(['id', 'name', 'email']);
 *
 * // Using options object
 * const UserMapper = rowmapper<UserRow>({
 *   headers: ['id', 'name', 'email'],
 *   className: 'UserMapper',
 *   index: true
 * });
 *
 * // Create row instances
 * const row1 = new UserMapper([1, 'Alice', 'alice@example.com']);
 * const row2 = UserMapper([2, 'Bob', 'bob@example.com']);
 * ```
 *
 * @param config - Either an array of headers or a configuration object
 * @returns A class/function that can create row mapping instances
 * @throws {Error} If no headers are provided
 */
export default function rowmapper<T extends Record<string, any>>(
  config: (keyof T)[] | RowMapperOptions<T>
): RowMapperClass<T>;

