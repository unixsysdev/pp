// Enterprise Language Lexer - Clean Version

export enum TokenType {
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
  
  // Operators
  ASSIGN = '=',
  PLUS = '+',
  MINUS = '-',
  MULTIPLY = '*',
  DIVIDE = '/',
  EQUAL = '==',
  
  // Delimiters
  LPAREN = '(',
  RPAREN = ')',
  LBRACE = '{',
  RBRACE = '}',
  SEMICOLON = ';',
  COLON = ':',
  ARROW = '->',
  
  // Special
  EOF = 'EOF',
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

export class Lexer {
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
      this.skipWhitespace();
      
      if (this.position >= this.source.length) {
        break;
      }

      const token = this.nextToken();
      if (token) {
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

  private nextToken(): Token | null {
    const char = this.source[this.position];
    
    // Numbers
    if (/\d/.test(char)) {
      return this.readNumber();
    }
    
    // Strings
    if (char === '"') {
      return this.readString();
    }
    
    // Identifiers and keywords
    if (/[a-zA-Z_]/.test(char)) {
      return this.readIdentifier();
    }
    
    // Two-character operators
    if (this.position + 1 < this.source.length) {
      const twoChar = this.source.substr(this.position, 2);
      if (twoChar === '==' || twoChar === '->') {
        this.position += 2;
        this.column += 2;
        return this.makeToken(twoChar === '==' ? TokenType.EQUAL : TokenType.ARROW, twoChar);
      }
    }
    
    // Single-character tokens
    const singleCharTokens: { [key: string]: TokenType } = {
      '=': TokenType.ASSIGN,
      '+': TokenType.PLUS,
      '-': TokenType.MINUS,
      '*': TokenType.MULTIPLY,
      '/': TokenType.DIVIDE,
      '(': TokenType.LPAREN,
      ')': TokenType.RPAREN,
      '{': TokenType.LBRACE,
      '}': TokenType.RBRACE,
      ';': TokenType.SEMICOLON,
      ':': TokenType.COLON,
    };
    
    if (singleCharTokens[char]) {
      this.position++;
      this.column++;
      return this.makeToken(singleCharTokens[char], char);
    }
    
    // Skip unknown characters
    this.position++;
    this.column++;
    return null;
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
      if (this.source[this.position] === '\n') {
        this.line++;
        this.column = 1;
      } else {
        this.column++;
      }
      this.position++;
    }
    
    if (this.position < this.source.length) {
      this.position++; // Skip closing quote
      this.column++;
    }
    
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
    
    // Check for keywords
    const keywords: { [key: string]: TokenType } = {
      'let': TokenType.LET,
      'const': TokenType.CONST,
      'fn': TokenType.FN,
      'if': TokenType.IF,
      'else': TokenType.ELSE,
      'true': TokenType.BOOLEAN,
      'false': TokenType.BOOLEAN,
    };
    
    const tokenType = keywords[value] || TokenType.IDENTIFIER;
    return this.makeToken(tokenType, value);
  }

  private skipWhitespace(): void {
    while (this.position < this.source.length) {
      const char = this.source[this.position];
      if (char === ' ' || char === '\t' || char === '\r') {
        this.position++;
        this.column++;
      } else if (char === '\n') {
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
}
