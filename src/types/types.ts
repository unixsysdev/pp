// Enterprise Language Type System - Clean Version

export abstract class Type {
  abstract toString(): string;
  abstract equals(other: Type): boolean;
}

export class PrimitiveType extends Type {
  constructor(public name: string) {
    super();
  }

  toString(): string {
    return this.name;
  }

  equals(other: Type): boolean {
    return other instanceof PrimitiveType && other.name === this.name;
  }
}

export class FunctionType extends Type {
  constructor(public params: Type[], public returnType: Type) {
    super();
  }

  toString(): string {
    const paramStr = this.params.map(p => p.toString()).join(', ');
    return `(${paramStr}) -> ${this.returnType.toString()}`;
  }

  equals(other: Type): boolean {
    return other instanceof FunctionType &&
           this.params.length === other.params.length &&
           this.params.every((p, i) => p.equals(other.params[i])) &&
           this.returnType.equals(other.returnType);
  }
}
