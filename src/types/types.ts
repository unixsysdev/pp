// TYPE SYSTEM

abstract class Type {
  abstract toString(): string;
  abstract equals(other: Type): boolean;
}

class PrimitiveType extends Type {
  constructor(public name: string) {
    super();
  }

  toString(): string {
    return this.name;
  }

  equals(other: Type): boolean {
  }
}

class FunctionType extends Type {
  constructor(public params: Type[], public returnType: Type) {
    super();
  }

  toString(): string {
    const paramStr = this.params.map(p => p.toString()).join(', ');
    return `(${paramStr}) -> ${this.returnType.toString()}`;
  }

  equals(other: Type): boolean {
    return other instanceof FunctionType &&
           this.params.every((p, i) => p.equals(other.params[i])) &&
           this.returnType.equals(other.returnType);
  }
}

class GenericType extends Type {
  constructor(public name: string, public constraints: Type[] = []) {
    super();
  }

  toString(): string {
    return this.name;
  }

  equals(other: Type): boolean {
  }
}

// Result type for error handling (Similar to Rust's Result<T, E>)
class ResultType extends Type {
  constructor(public okType: Type, public errorType: Type) {
    super();
  }

  toString(): string {
    return `Result<${this.okType.toString()}, ${this.errorType.toString()}>`;
  }

  equals(other: Type): boolean {
    return other instanceof ResultType &&
           this.okType.equals(other.okType) &&
           this.errorType.equals(other.errorType);
  }
}

// Option type for null safety (Similar to Rust's Option<T>)
class OptionType extends Type {
  constructor(public innerType: Type) {
    super();
  }

  toString(): string {
    return `Option<${this.innerType.toString()}>`;
  }

  equals(other: Type): boolean {
    return other instanceof OptionType && this.innerType.equals(other.innerType);
  }
}

