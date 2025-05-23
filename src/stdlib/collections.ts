// Enhanced Standard Library - Collections Module
// src/stdlib/collections.ts
// Enhanced Standard Library - Collections Module

import { Value, NumberValue, StringValue, BooleanValue, OptionValue, ResultValue } from '../interpreter/interpreter';

// ============================================================================
// COLLECTION TYPES
// ============================================================================

export class ArrayValue extends Value {
  constructor(public elements: Value[]) {
    super();
  }

  toString(): string {
    return `[${this.elements.map(e => e.toString()).join(', ')}]`;
  }

  get(index: number): OptionValue {
    if (index >= 0 && index < this.elements.length) {
      return new OptionValue(this.elements[index]);
    }
    return new OptionValue(null);
  }

  set(index: number, value: Value): ResultValue {
    if (index >= 0 && index < this.elements.length) {
      this.elements[index] = value;
      return new ResultValue(true, new NumberValue(0));
    }
    return new ResultValue(false, new StringValue(`Index out of bounds: ${index}`));
  }

  push(value: Value): NumberValue {
    this.elements.push(value);
    return new NumberValue(this.elements.length);
  }

  pop(): OptionValue {
    const element = this.elements.pop();
    return new OptionValue(element || null);
  }

  length(): NumberValue {
    return new NumberValue(this.elements.length);
  }

  map(func: FunctionValue): ArrayValue {
    const newElements = this.elements.map(element => {
      // Call function with element as argument
      return func.call([element]);
    });
    return new ArrayValue(newElements);
  }

  filter(func: FunctionValue): ArrayValue {
    const newElements = this.elements.filter(element => {
      const result = func.call([element]);
      return result instanceof BooleanValue && result.value;
    });
    return new ArrayValue(newElements);
  }

  reduce(func: FunctionValue, initial: Value): Value {
    let accumulator = initial;
    for (const element of this.elements) {
      accumulator = func.call([accumulator, element]);
    }
    return accumulator;
  }
}

export class MapValue extends Value {
  private data = new Map<string, Value>();

  constructor(entries: [string, Value][] = []) {
    super();
    for (const [key, value] of entries) {
      this.data.set(key, value);
    }
  }

  toString(): string {
    const entries = Array.from(this.data.entries())
      .map(([k, v]) => `"${k}": ${v.toString()}`)
      .join(', ');
    return `{${entries}}`;
  }

  get(key: string): OptionValue {
    const value = this.data.get(key);
    return new OptionValue(value || null);
  }

  set(key: string, value: Value): MapValue {
    this.data.set(key, value);
    return this;
  }

  has(key: string): BooleanValue {
    return new BooleanValue(this.data.has(key));
  }

  remove(key: string): BooleanValue {
    return new BooleanValue(this.data.delete(key));
  }

  keys(): ArrayValue {
    return new ArrayValue(Array.from(this.data.keys()).map(k => new StringValue(k)));
  }

  values(): ArrayValue {
    return new ArrayValue(Array.from(this.data.values()));
  }

  size(): NumberValue {
    return new NumberValue(this.data.size);
  }
}

// ============================================================================
// STRING UTILITIES
// ============================================================================

export class StringUtils {
  static split(str: StringValue, delimiter: StringValue): ArrayValue {
    const parts = str.value.split(delimiter.value);
    return new ArrayValue(parts.map(part => new StringValue(part)));
  }

  static join(arr: ArrayValue, delimiter: StringValue): StringValue {
    const strings = arr.elements.map(e => e.toString());
    return new StringValue(strings.join(delimiter.value));
  }

  static substring(str: StringValue, start: NumberValue, end?: NumberValue): StringValue {
    const endIndex = end ? end.value : str.value.length;
    return new StringValue(str.value.substring(start.value, endIndex));
  }

  static indexOf(str: StringValue, searchStr: StringValue): NumberValue {
    return new NumberValue(str.value.indexOf(searchStr.value));
  }

  static replace(str: StringValue, search: StringValue, replacement: StringValue): StringValue {
    return new StringValue(str.value.replace(search.value, replacement.value));
  }

  static toUpperCase(str: StringValue): StringValue {
    return new StringValue(str.value.toUpperCase());
  }

  static toLowerCase(str: StringValue): StringValue {
    return new StringValue(str.value.toLowerCase());
  }

  static trim(str: StringValue): StringValue {
    return new StringValue(str.value.trim());
  }

  static length(str: StringValue): NumberValue {
    return new NumberValue(str.value.length);
  }
}

// ============================================================================
// MATH UTILITIES
// ============================================================================

export class MathUtils {
  static abs(n: NumberValue): NumberValue {
    return new NumberValue(Math.abs(n.value));
  }

  static sqrt(n: NumberValue): ResultValue {
    if (n.value < 0) {
      return new ResultValue(false, new StringValue("Cannot take square root of negative number"));
    }
    return new ResultValue(true, new NumberValue(Math.sqrt(n.value)));
  }

  static pow(base: NumberValue, exponent: NumberValue): NumberValue {
    return new NumberValue(Math.pow(base.value, exponent.value));
  }

  static floor(n: NumberValue): NumberValue {
    return new NumberValue(Math.floor(n.value));
  }

  static ceil(n: NumberValue): NumberValue {
    return new NumberValue(Math.ceil(n.value));
  }

  static round(n: NumberValue): NumberValue {
    return new NumberValue(Math.round(n.value));
  }

  static min(a: NumberValue, b: NumberValue): NumberValue {
    return new NumberValue(Math.min(a.value, b.value));
  }

  static max(a: NumberValue, b: NumberValue): NumberValue {
    return new NumberValue(Math.max(a.value, b.value));
  }

  static random(): NumberValue {
    return new NumberValue(Math.random());
  }

  static sin(n: NumberValue): NumberValue {
    return new NumberValue(Math.sin(n.value));
  }

  static cos(n: NumberValue): NumberValue {
    return new NumberValue(Math.cos(n.value));
  }

  static tan(n: NumberValue): NumberValue {
    return new NumberValue(Math.tan(n.value));
  }

  static pi(): NumberValue {
    return new NumberValue(Math.PI);
  }

  static e(): NumberValue {
    return new NumberValue(Math.E);
  }
}

// ============================================================================
// I/O UTILITIES
// ============================================================================

export class IOUtils {
  static readFile(filename: StringValue): ResultValue {
    try {
      // In a real implementation, this would read from filesystem
      // For now, simulate with predefined content
      const content = `// Simulated file content for ${filename.value}\n`;
      return new ResultValue(true, new StringValue(content));
    } catch (error) {
      return new ResultValue(false, new StringValue(`Failed to read file: ${filename.value}`));
    }
  }

  static writeFile(filename: StringValue, content: StringValue): ResultValue {
    try {
      // In a real implementation, this would write to filesystem
      console.log(`Writing to ${filename.value}:`, content.value);
      return new ResultValue(true, new NumberValue(0));
    } catch (error) {
      return new ResultValue(false, new StringValue(`Failed to write file: ${filename.value}`));
    }
  }

  static println(value: Value): NumberValue {
    console.log(value.toString());
    return new NumberValue(0);
  }

  static print(value: Value): NumberValue {
    process.stdout.write(value.toString());
    return new NumberValue(0);
  }

  static input(prompt?: StringValue): StringValue {
    if (prompt) {
      process.stdout.write(prompt.value);
    }
    // In a real implementation, this would read from stdin
    return new StringValue("simulated user input");
  }
}

// ============================================================================
// JSON UTILITIES
// ============================================================================

export class JSONUtils {
  static stringify(value: Value): ResultValue {
    try {
      const jsonValue = this.valueToJSON(value);
      return new ResultValue(true, new StringValue(JSON.stringify(jsonValue)));
    } catch (error) {
      return new ResultValue(false, new StringValue(`JSON stringify error: ${error}`));
    }
  }

  static parse(jsonStr: StringValue): ResultValue {
    try {
      const parsed = JSON.parse(jsonStr.value);
      const value = this.jsonToValue(parsed);
      return new ResultValue(true, value);
    } catch (error) {
      return new ResultValue(false, new StringValue(`JSON parse error: ${error}`));
    }
  }

  private static valueToJSON(value: Value): any {
    if (value instanceof NumberValue) {
      return value.value;
    } else if (value instanceof StringValue) {
      return value.value;
    } else if (value instanceof BooleanValue) {
      return value.value;
    } else if (value instanceof ArrayValue) {
      return value.elements.map(e => this.valueToJSON(e));
    } else if (value instanceof MapValue) {
      const obj: any = {};
      const keys = value.keys().elements;
      const values = value.values().elements;
      for (let i = 0; i < keys.length; i++) {
        const key = (keys[i] as StringValue).value;
        obj[key] = this.valueToJSON(values[i]);
      }
      return obj;
    }
    return null;
  }

  private static jsonToValue(json: any): Value {
    if (typeof json === 'number') {
      return new NumberValue(json);
    } else if (typeof json === 'string') {
      return new StringValue(json);
    } else if (typeof json === 'boolean') {
      return new BooleanValue(json);
    } else if (Array.isArray(json)) {
      return new ArrayValue(json.map(item => this.jsonToValue(item)));
    } else if (json && typeof json === 'object') {
      const entries: [string, Value][] = Object.entries(json)
        .map(([k, v]) => [k, this.jsonToValue(v)]);
      return new MapValue(entries);
    }
    return new OptionValue(null);
  }
}

// ============================================================================
// TIME UTILITIES
// ============================================================================

export class TimeValue extends Value {
  constructor(public timestamp: number) {
    super();
  }

  toString(): string {
    return new Date(this.timestamp).toISOString();
  }

  static now(): TimeValue {
    return new TimeValue(Date.now());
  }

  static fromString(dateStr: StringValue): ResultValue {
    try {
      const timestamp = Date.parse(dateStr.value);
      if (isNaN(timestamp)) {
        return new ResultValue(false, new StringValue(`Invalid date string: ${dateStr.value}`));
      }
      return new ResultValue(true, new TimeValue(timestamp));
    } catch (error) {
      return new ResultValue(false, new StringValue(`Date parse error: ${error}`));
    }
  }

  year(): NumberValue {
    return new NumberValue(new Date(this.timestamp).getFullYear());
  }

  month(): NumberValue {
    return new NumberValue(new Date(this.timestamp).getMonth() + 1); // 1-based
  }

  day(): NumberValue {
    return new NumberValue(new Date(this.timestamp).getDate());
  }

  hour(): NumberValue {
    return new NumberValue(new Date(this.timestamp).getHours());
  }

  minute(): NumberValue {
    return new NumberValue(new Date(this.timestamp).getMinutes());
  }

  second(): NumberValue {
    return new NumberValue(new Date(this.timestamp).getSeconds());
  }

  addDays(days: NumberValue): TimeValue {
    return new TimeValue(this.timestamp + days.value * 24 * 60 * 60 * 1000);
  }

  addHours(hours: NumberValue): TimeValue {
    return new TimeValue(this.timestamp + hours.value * 60 * 60 * 1000);
  }

  addMinutes(minutes: NumberValue): TimeValue {
    return new TimeValue(this.timestamp + minutes.value * 60 * 1000);
  }

  format(pattern: StringValue): StringValue {
    const date = new Date(this.timestamp);
    // Simple format implementation - in reality would use a proper date formatting library
    let result = pattern.value;
    result = result.replace('YYYY', date.getFullYear().toString());
    result = result.replace('MM', (date.getMonth() + 1).toString().padStart(2, '0'));
    result = result.replace('DD', date.getDate().toString().padStart(2, '0'));
    result = result.replace('HH', date.getHours().toString().padStart(2, '0'));
    result = result.replace('mm', date.getMinutes().toString().padStart(2, '0'));
    result = result.replace('ss', date.getSeconds().toString().padStart(2, '0'));
    return new StringValue(result);
  }
}

// Import the FunctionValue type (this would need to be imported from interpreter)
interface FunctionValue {
  call(args: Value[]): Value;
}
