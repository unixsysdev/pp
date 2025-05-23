class Parser {
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
      
      if (this.match(TokenType.IF)) {
        return this.ifStatement();
      }
      
      return this.expressionStatement();
    } catch (error) {
      this.synchronize();
      return null;
    }
  }

  private variableDeclaration(): VariableDeclaration {
    
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
      } while (this.match(TokenType.COMMA));
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

  private ifStatement(): IfStatement {
    this.consume(TokenType.LPAREN, "Expected '(' after 'if'");
    const condition = this.expression();
    this.consume(TokenType.RPAREN, "Expected ')' after if condition");
    
    this.consume(TokenType.LBRACE, "Expected '{' after if condition");
    const thenBranch: Statement[] = [];
    
    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      const stmt = this.statement();
      if (stmt) {
        thenBranch.push(stmt);
      }
    }
    
    this.consume(TokenType.RBRACE, "Expected '}' after then branch");
    
    let elseBranch: Statement[] | null = null;
    if (this.match(TokenType.ELSE)) {
      this.consume(TokenType.LBRACE, "Expected '{' after 'else'");
      elseBranch = [];
      
      while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
        const stmt = this.statement();
        if (stmt) {
          elseBranch.push(stmt);
        }
      }
      
      this.consume(TokenType.RBRACE, "Expected '}' after else branch");
    }
    
    return new IfStatement(condition, thenBranch, elseBranch);
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
    
    while (this.match(TokenType.EQUAL, TokenType.NOT_EQUAL)) {
      const operator = this.previous().type;
      const right = this.comparison();
      expr = new BinaryExpression(expr, operator, right);
    }
    
    return expr;
  }

  private comparison(): Expression {
    let expr = this.term();
    
    while (this.match(TokenType.GREATER, TokenType.LESS)) {
      const operator = this.previous().type;
      const right = this.term();
      expr = new BinaryExpression(expr, operator, right);
    }
    
    return expr;
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
    let expr = this.call();
    
    while (this.match(TokenType.DIVIDE, TokenType.MULTIPLY)) {
      const operator = this.previous().type;
      const right = this.call();
      expr = new BinaryExpression(expr, operator, right);
    }
    
    return expr;
  }

  private call(): Expression {
    let expr = this.primary();
    
    while (true) {
      if (this.match(TokenType.LPAREN)) {
        expr = this.finishCall(expr);
      } else {
        break;
      }
    }
    
    return expr;
  }

  private finishCall(callee: Expression): Expression {
    const args: Expression[] = [];
    
    if (!this.check(TokenType.RPAREN)) {
      do {
        args.push(this.expression());
      } while (this.match(TokenType.COMMA));
    }
    
    this.consume(TokenType.RPAREN, "Expected ')' after arguments");
    
    return new FunctionCall(callee, args);
  }

  private primary(): Expression {
    if (this.match(TokenType.BOOLEAN)) {
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
    
    throw new Error(`Unexpected token: ${this.peek().value} at line ${this.peek().line}`);
  }

  private parseType(): Type {
    if (this.match(TokenType.IDENTIFIER)) {
      const typeName = this.previous().value;
      
      // Handle generic types like Option<T> or Result<T, E>
      if (this.match(TokenType.LESS)) {
        const innerTypes: Type[] = [];
        
        do {
          innerTypes.push(this.parseType());
        } while (this.match(TokenType.COMMA));
        
        this.consume(TokenType.GREATER, "Expected '>' after generic parameters");
        
          return new OptionType(innerTypes[0]);
          return new ResultType(innerTypes[0], innerTypes[1]);
        }
      }
      
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
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
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
    throw new Error(`${message}. Got: ${token.value} at line ${token.line}, column ${token.column}`);
  }

  private synchronize(): void {
    this.advance();
    
    while (!this.isAtEnd()) {
      
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

