// LEXER & TOKENIZER

enum TokenType {
  // Literals
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  BOOLEAN = 'BOOLEAN',
  
  // Identifiers
  IDENTIFIER = 'IDENTIFIER',
  
  // Keywords
  LET = 'let',
  CONST = 'const',
  FN = 'fn',
  IF = 'if',
  ELSE = 'else',
  MATCH = 'match',
  TYPE = 'type',
  ENUM = 'enum',
  STRUCT = 'struct',
  IMPL = 'impl',
  ASYNC = 'async',
  AWAIT = 'await',
  
  // Operators
  ASSIGN = '=',
  PLUS = '+',
  MINUS = '-',
  MULTIPLY = '*',
  DIVIDE = '/',
  EQUAL = '==',
  NOT_EQUAL = '!=',
  LESS = '<',
  GREATER = '>',
  ARROW = '->',
  FAT_ARROW = '=>',
  
  // Delimiters
  LPAREN = '(',
  RPAREN = ')',
  LBRACE = '{',
  RBRACE = '}',
  LBRACKET = '[',
  RBRACKET = ']',
  COMMA = ',',
  SEMICOLON = ';',
  COLON = ':',
  DOT = '.',
  PIPE = '|',
  
  // Special
  EOF = 'EOF',
  NEWLINE = 'NEWLINE',
}

interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

class Lexer {
  private source: string;
  private position = 0;
  private line = 1;
  private column = 1;

  constructor(source: string) {
    this.source = source;
  }

  tokenize(): Token[] {
    const tokens: Token[] = [];
    
    while (this.position < this.source.length) {
      const token = this.nextToken();
      if (token.type !== TokenType.NEWLINE) {
        tokens.push(token);
      }
    }
    
    tokens.push({
      type: TokenType.EOF,
      value: '',
      line: this.line,
      column: this.column
    });
    
    return tokens;
  }

  private nextToken(): Token {
    this.skipWhitespace();
    
    if (this.position >= this.source.length) {
      return this.makeToken(TokenType.EOF, '');
    }

    const char = this.source[this.position];
    
    // Numbers
    if (/\d/.test(char)) {
      return this.readNumber();
    }
    
    // Strings
      return this.readString();
    }
    
    // Identifiers and keywords
    if (/[a-zA-Z_]/.test(char)) {
      return this.readIdentifier();
    }
    
    // Two-character operators
    if (this.position + 1 < this.source.length) {
      const twoChar = this.source.substr(this.position, 2);
      const tokenType = this.getTwoCharTokenType(twoChar);
      if (tokenType) {
        this.position += 2;
        this.column += 2;
        return this.makeToken(tokenType, twoChar);
      }
    }
    
    // Single-character tokens
    const tokenType = this.getSingleCharTokenType(char);
    if (tokenType) {
      this.position++;
      this.column++;
      return this.makeToken(tokenType, char);
    }
    
    throw new Error(`Unexpected character: ${char} at line ${this.line}, column ${this.column}`);
  }

  private readNumber(): Token {
    const start = this.position;
    
    while (this.position < this.source.length && /[\d.]/.test(this.source[this.position])) {
      this.position++;
      this.column++;
    }
    
    const value = this.source.substring(start, this.position);
    return this.makeToken(TokenType.NUMBER, value);
  }

  private readString(): Token {
    const start = this.position;
    this.position++; // Skip opening quote
    this.column++;
    
    while (this.position < this.source.length && this.source[this.position] !== '"') {
        this.line++;
        this.column = 1;
      } else {
        this.column++;
      }
      this.position++;
    }
    
    if (this.position >= this.source.length) {
      throw new Error(`Unterminated string at line ${this.line}`);
    }
    
    this.position++; // Skip closing quote
    this.column++;
    
    const value = this.source.substring(start + 1, this.position - 1);
    return this.makeToken(TokenType.STRING, value);
  }

  private readIdentifier(): Token {
    const start = this.position;
    
    while (this.position < this.source.length && /[a-zA-Z0-9_]/.test(this.source[this.position])) {
      this.position++;
      this.column++;
    }
    
    const value = this.source.substring(start, this.position);
    const tokenType = this.getKeywordTokenType(value) || TokenType.IDENTIFIER;
    
    return this.makeToken(tokenType, value);
  }

  private skipWhitespace(): void {
    while (this.position < this.source.length) {
      const char = this.source[this.position];
        this.position++;
        this.column++;
        this.position++;
        this.line++;
        this.column = 1;
      } else {
        break;
      }
    }
  }

  private makeToken(type: TokenType, value: string): Token {
    return {
      type,
      value,
      line: this.line,
      column: this.column - value.length
    };
  }

  private getKeywordTokenType(value: string): TokenType | null {
    const keywords: Record<string, TokenType> = {
      'let': TokenType.LET,
      'const': TokenType.CONST,
      'fn': TokenType.FN,
      'if': TokenType.IF,
      'else': TokenType.ELSE,
      'match': TokenType.MATCH,
      'type': TokenType.TYPE,
      'enum': TokenType.ENUM,
      'struct': TokenType.STRUCT,
      'impl': TokenType.IMPL,
      'async': TokenType.ASYNC,
      'await': TokenType.AWAIT,
      'true': TokenType.BOOLEAN,
      'false': TokenType.BOOLEAN,
    };
    
    return keywords[value] || null;
  }

  private getSingleCharTokenType(char: string): TokenType | null {
    const singleChars: Record<string, TokenType> = {
      '=': TokenType.ASSIGN,
      '+': TokenType.PLUS,
      '-': TokenType.MINUS,
      '*': TokenType.MULTIPLY,
      '/': TokenType.DIVIDE,
      '<': TokenType.LESS,
      '>': TokenType.GREATER,
      '(': TokenType.LPAREN,
      ')': TokenType.RPAREN,
      '{': TokenType.LBRACE,
      '}': TokenType.RBRACE,
      '[': TokenType.LBRACKET,
      ']': TokenType.RBRACKET,
      ',': TokenType.COMMA,
      ';': TokenType.SEMICOLON,
      ':': TokenType.COLON,
      '.': TokenType.DOT,
      '|': TokenType.PIPE,
    };
    
    return singleChars[char] || null;
  }

  private getTwoCharTokenType(chars: string): TokenType | null {
    const twoChars: Record<string, TokenType> = {
      '==': TokenType.EQUAL,
      '!=': TokenType.NOT_EQUAL,
      '->': TokenType.ARROW,
      '=>': TokenType.FAT_ARROW,
    };
    
    return twoChars[chars] || null;
  }
}

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

// AST NODES

abstract class ASTNode {}

abstract class Expression extends ASTNode {
  type?: Type;
}

abstract class Statement extends ASTNode {}

class NumberLiteral extends Expression {
  constructor(public value: number) {
    super();
    this.type = new PrimitiveType('number');
  }
}

class StringLiteral extends Expression {
  constructor(public value: string) {
    super();
    this.type = new PrimitiveType('string');
  }
}

class BooleanLiteral extends Expression {
  constructor(public value: boolean) {
    super();
    this.type = new PrimitiveType('boolean');
  }
}

class Identifier extends Expression {
  constructor(public name: string) {
    super();
  }
}

class BinaryExpression extends Expression {
  constructor(
    public left: Expression,
    public operator: TokenType,
    public right: Expression
  ) {
    super();
  }
}

class FunctionCall extends Expression {
  constructor(public callee: Expression, public args: Expression[]) {
    super();
  }
}

class VariableDeclaration extends Statement {
  constructor(
    public name: string,
    public typeAnnotation: Type | null,
    public initializer: Expression | null,
    public isConst: boolean = false
  ) {
    super();
  }
}

class FunctionDeclaration extends Statement {
  constructor(
    public name: string,
    public params: { name: string; type: Type }[],
    public returnType: Type,
    public body: Statement[]
  ) {
    super();
  }
}

class IfStatement extends Statement {
  constructor(
    public condition: Expression,
    public thenBranch: Statement[],
    public elseBranch: Statement[] | null = null
  ) {
    super();
  }
}

class ReturnStatement extends Statement {
  constructor(public value: Expression | null) {
    super();
  }
}

class ExpressionStatement extends Statement {
  constructor(public expression: Expression) {
    super();
  }
}

