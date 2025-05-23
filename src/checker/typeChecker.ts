// TYPE CHECKER

class TypeChecker {
  private scope: Map<string, Type> = new Map();
  private scopes: Map<string, Type>[] = [];

  typeCheck(statements: Statement[]): void {
    for (const stmt of statements) {
      this.checkStatement(stmt);
    }
  }

  private checkStatement(stmt: Statement): void {
    if (stmt instanceof VariableDeclaration) {
      this.checkVariableDeclaration(stmt);
    } else if (stmt instanceof FunctionDeclaration) {
      this.checkFunctionDeclaration(stmt);
    } else if (stmt instanceof IfStatement) {
      this.checkIfStatement(stmt);
    } else if (stmt instanceof ExpressionStatement) {
      this.checkExpression(stmt.expression);
    }
  }

  private checkVariableDeclaration(stmt: VariableDeclaration): void {
    if (stmt.initializer) {
      this.checkExpression(stmt.initializer);
      
      if (stmt.typeAnnotation) {
        if (!this.isAssignable(stmt.initializer.type!, stmt.typeAnnotation)) {
          throw new Error(
            `Type mismatch: Cannot assign ${stmt.initializer.type!.toString()} to ${stmt.typeAnnotation.toString()}`
          );
        }
      } else {
        // Type inference
        stmt.typeAnnotation = stmt.initializer.type!;
      }
    }
    
    if (!stmt.typeAnnotation) {
      throw new Error(`Cannot infer type for variable '${stmt.name}' without initializer or type annotation`);
    }
    
    this.scope.set(stmt.name, stmt.typeAnnotation);
  }

  private checkFunctionDeclaration(stmt: FunctionDeclaration): void {
    // Add function to scope first (for recursion)
    const funcType = new FunctionType(
      stmt.params.map(p => p.type),
      stmt.returnType
    );
    this.scope.set(stmt.name, funcType);
    
    // Check function body in new scope
    this.pushScope();
    
    for (const param of stmt.params) {
      this.scope.set(param.name, param.type);
    }
    
    for (const bodyStmt of stmt.body) {
      this.checkStatement(bodyStmt);
    }
    
    this.popScope();
  }

  private checkIfStatement(stmt: IfStatement): void {
    this.checkExpression(stmt.condition);
    
    if (!stmt.condition.type!.equals(new PrimitiveType('boolean'))) {
      throw new Error(`If condition must be boolean, got ${stmt.condition.type!.toString()}`);
    }
    
    this.pushScope();
    for (const thenStmt of stmt.thenBranch) {
      this.checkStatement(thenStmt);
    }
    this.popScope();
    
    if (stmt.elseBranch) {
      this.pushScope();
      for (const elseStmt of stmt.elseBranch) {
        this.checkStatement(elseStmt);
      }
      this.popScope();
    }
  }

  private checkExpression(expr: Expression): void {
    if (expr instanceof NumberLiteral) {
      expr.type = new PrimitiveType('number');
    } else if (expr instanceof StringLiteral) {
      expr.type = new PrimitiveType('string');
    } else if (expr instanceof BooleanLiteral) {
      expr.type = new PrimitiveType('boolean');
    } else if (expr instanceof Identifier) {
      const type = this.lookupVariable(expr.name);
      if (!type) {
        throw new Error(`Undefined variable: ${expr.name}`);
      }
      expr.type = type;
    } else if (expr instanceof BinaryExpression) {
      this.checkBinaryExpression(expr);
    } else if (expr instanceof FunctionCall) {
      this.checkFunctionCall(expr);
    }
  }

  private checkBinaryExpression(expr: BinaryExpression): void {
    this.checkExpression(expr.left);
    this.checkExpression(expr.right);
    
    const leftType = expr.left.type!;
    const rightType = expr.right.type!;
    
    switch (expr.operator) {
      case TokenType.PLUS:
      case TokenType.MINUS:
      case TokenType.MULTIPLY:
      case TokenType.DIVIDE:
        if (leftType.equals(new PrimitiveType('number')) && 
            rightType.equals(new PrimitiveType('number'))) {
          expr.type = new PrimitiveType('number');
        } else {
          throw new Error(`Arithmetic operation requires numbers, got ${leftType.toString()} and ${rightType.toString()}`);
        }
        break;
        
      case TokenType.EQUAL:
      case TokenType.NOT_EQUAL:
        if (this.isAssignable(leftType, rightType) || this.isAssignable(rightType, leftType)) {
          expr.type = new PrimitiveType('boolean');
        } else {
          throw new Error(`Cannot compare ${leftType.toString()} and ${rightType.toString()}`);
        }
        break;
        
      case TokenType.LESS:
      case TokenType.GREATER:
        if (leftType.equals(new PrimitiveType('number')) && 
            rightType.equals(new PrimitiveType('number'))) {
          expr.type = new PrimitiveType('boolean');
        } else {
          throw new Error(`Comparison requires numbers, got ${leftType.toString()} and ${rightType.toString()}`);
        }
        break;
    }
  }

  private checkFunctionCall(expr: FunctionCall): void {
    this.checkExpression(expr.callee);
    
    if (!(expr.callee.type instanceof FunctionType)) {
      throw new Error(`Cannot call non-function type: ${expr.callee.type!.toString()}`);
    }
    
    const funcType = expr.callee.type as FunctionType;
    
    if (expr.args.length !== funcType.params.length) {
      throw new Error(`Function expects ${funcType.params.length} arguments, got ${expr.args.length}`);
    }
    
    for (let i = 0; i < expr.args.length; i++) {
      this.checkExpression(expr.args[i]);
      if (!this.isAssignable(expr.args[i].type!, funcType.params[i])) {
        throw new Error(
          `Argument ${i + 1}: expected ${funcType.params[i].toString()}, got ${expr.args[i].type!.toString()}`
        );
      }
    }
    
    expr.type = funcType.returnType;
  }

  private isAssignable(from: Type, to: Type): boolean {
    return from.equals(to);
  }

  private lookupVariable(name: string): Type | null {
    // Check current scope first
    if (this.scope.has(name)) {
      return this.scope.get(name)!;
    }
    
    // Check parent scopes
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].has(name)) {
        return this.scopes[i].get(name)!;
      }
    }
    
    return null;
  }

  private pushScope(): void {
    this.scopes.push(new Map(this.scope));
  }

  private popScope(): void {
    if (this.scopes.length > 0) {
      this.scope = this.scopes.pop()!;
    }
  }
}

