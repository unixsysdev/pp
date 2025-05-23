// Enterprise Language Parser - Clean Version

import { Token, TokenType } from '../lexer/lexer';
import { Statement, Expression, VariableDeclaration, FunctionDeclaration, 
         NumberLiteral, StringLiteral, BooleanLiteral, Identifier, 
         BinaryExpression, ExpressionStatement } from '../ast/nodes';
import { Type, PrimitiveType } from '../types/types';

export class Parser {
  private tokens: Token[];
  private current = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): Statement[] {
    const statements: Statement[] = [];
    
    while (!this.isAtEnd()) {
      const stmt = this.statement();
      if (stmt) {
        statements.push(stmt);
      }
    }
    
    return statements;
  }

  private statement(): Statement | null {
    try {
      if (this.match(TokenType.LET, TokenType.CONST)) {
        return this.variableDeclaration();
      }
      
      if (this.match(TokenType.FN)) {
        return this.functionDeclaration();
      }
      
      return this.expressionStatement();
    } catch (error) {
      this.synchronize();
      return null;
    }
  }

  private variableDeclaration(): VariableDeclaration {
    const isConst = this.previous().type === TokenType.CONST;
    
    this.consume(TokenType.IDENTIFIER, "Expected variable name");
    const name = this.previous().value;
    
    let typeAnnotation: Type | null = null;
    if (this.match(TokenType.COLON)) {
      typeAnnotation = this.parseType();
    }
    
    let initializer: Expression | null = null;
    if (this.match(TokenType.ASSIGN)) {
      initializer = this.expression();
    }
    
    this.consume(TokenType.SEMICOLON, "Expected ';' after variable declaration");
    
    return new VariableDeclaration(name, typeAnnotation, initializer, isConst);
  }

  private functionDeclaration(): FunctionDeclaration {
    this.consume(TokenType.IDENTIFIER, "Expected function name");
    const name = this.previous().value;
    
    this.consume(TokenType.LPAREN, "Expected '(' after function name");
    
    const params: { name: string; type: Type }[] = [];
    if (!this.check(TokenType.RPAREN)) {
      do {
        this.consume(TokenType.IDENTIFIER, "Expected parameter name");
        const paramName = this.previous().value;
        
        this.consume(TokenType.COLON, "Expected ':' after parameter name");
        const paramType = this.parseType();
        
        params.push({ name: paramName, type: paramType });
      } while (this.match(TokenType.SEMICOLON)); // Use semicolon instead of comma for simplicity
    }
    
    this.consume(TokenType.RPAREN, "Expected ')' after parameters");
    
    this.consume(TokenType.ARROW, "Expected '->' after parameters");
    const returnType = this.parseType();
    
    this.consume(TokenType.LBRACE, "Expected '{' before function body");
    const body: Statement[] = [];
    
    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      const stmt = this.statement();
      if (stmt) {
        body.push(stmt);
      }
    }
    
    this.consume(TokenType.RBRACE, "Expected '}' after function body");
    
    return new FunctionDeclaration(name, params, returnType, body);
  }

  private expressionStatement(): ExpressionStatement {
    const expr = this.expression();
    this.consume(TokenType.SEMICOLON, "Expected ';' after expression");
    return new ExpressionStatement(expr);
  }

  private expression(): Expression {
    return this.equality();
  }

  private equality(): Expression {
    let expr = this.comparison();
    
    while (this.match(TokenType.EQUAL)) {
      const operator = this.previous().type;
      const right = this.comparison();
      expr = new BinaryExpression(expr, operator, right);
    }
    
    return expr;
  }

  private comparison(): Expression {
    return this.term();
  }

  private term(): Expression {
    let expr = this.factor();
    
    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.previous().type;
      const right = this.factor();
      expr = new BinaryExpression(expr, operator, right);
    }
    
    return expr;
  }

  private factor(): Expression {
    let expr = this.primary();
    
    while (this.match(TokenType.DIVIDE, TokenType.MULTIPLY)) {
      const operator = this.previous().type;
      const right = this.primary();
      expr = new BinaryExpression(expr, operator, right);
    }
    
    return expr;
  }

  private primary(): Expression {
    if (this.match(TokenType.BOOLEAN)) {
      return new BooleanLiteral(this.previous().value === 'true');
    }
    
    if (this.match(TokenType.NUMBER)) {
      return new NumberLiteral(parseFloat(this.previous().value));
    }
    
    if (this.match(TokenType.STRING)) {
      return new StringLiteral(this.previous().value);
    }
    
    if (this.match(TokenType.IDENTIFIER)) {
      return new Identifier(this.previous().value);
    }
    
    if (this.match(TokenType.LPAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RPAREN, "Expected ')' after expression");
      return expr;
    }
    
    throw new Error(`Unexpected token: ${this.peek().value}`);
  }

  private parseType(): Type {
    if (this.match(TokenType.IDENTIFIER)) {
      const typeName = this.previous().value;
      return new PrimitiveType(typeName);
    }
    
    throw new Error(`Expected type, got: ${this.peek().value}`);
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    
    const token = this.peek();
    throw new Error(`${message}. Got: ${token.value} at line ${token.line}`);
  }

  private synchronize(): void {
    this.advance();
    
    while (!this.isAtEnd()) {
      if (this.previous().type === TokenType.SEMICOLON) return;
      
      switch (this.peek().type) {
        case TokenType.FN:
        case TokenType.LET:
        case TokenType.CONST:
        case TokenType.IF:
          return;
      }
      
      this.advance();
    }
  }
}
