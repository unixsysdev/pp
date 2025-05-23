abstract class Value {
  abstract toString(): string;
}

class NumberValue extends Value {
  constructor(public value: number) {
    super();
  }
  
  toString(): string {
    return this.value.toString();
  }
}

class StringValue extends Value {
  constructor(public value: string) {
    super();
  }
  
  toString(): string {
    return this.value;
  }
}

class BooleanValue extends Value {
  constructor(public value: boolean) {
    super();
  }
  
  toString(): string {
    return this.value.toString();
  }
}

class FunctionValue extends Value {
  constructor(
    public declaration: FunctionDeclaration,
    public closure: Map<string, Value>
  ) {
    super();
  }
  
  toString(): string {
    return `<function ${this.declaration.name}>`;
  }
}

// Result type implementation for error handling
class ResultValue extends Value {
  constructor(public isOk: boolean, public value: Value) {
    super();
  }
  
  toString(): string {
    return this.isOk ? `Ok(${this.value.toString()})` : `Err(${this.value.toString()})`;
  }
}

// Option type implementation for null safety
class OptionValue extends Value {
  constructor(public value: Value | null) {
    super();
  }
  
  toString(): string {
    return this.value ? `Some(${this.value.toString()})` : 'None';
  }
}

class Interpreter {
  private globals = new Map<string, Value>();
  private environment = this.globals;
  private environments: Map<string, Value>[] = [];

  interpret(statements: Statement[]): void {
    try {
      for (const statement of statements) {
        this.execute(statement);
      }
    } catch (error) {
      console.error('Runtime Error:', error);
    }
  }

  private execute(stmt: Statement): void {
    if (stmt instanceof VariableDeclaration) {
      this.executeVariableDeclaration(stmt);
    } else if (stmt instanceof FunctionDeclaration) {
      this.executeFunctionDeclaration(stmt);
    } else if (stmt instanceof IfStatement) {
      this.executeIfStatement(stmt);
    } else if (stmt instanceof ExpressionStatement) {
      this.evaluate(stmt.expression);
    } else if (stmt instanceof ReturnStatement) {
      throw new ReturnException(stmt.value ? this.evaluate(stmt.value) : new NumberValue(0));
    }
  }

  private executeVariableDeclaration(stmt: VariableDeclaration): void {
    let value: Value = new NumberValue(0); // Default value
    
    if (stmt.initializer) {
      value = this.evaluate(stmt.initializer);
    }
    
    this.environment.set(stmt.name, value);
  }

  private executeFunctionDeclaration(stmt: FunctionDeclaration): void {
    const func = new FunctionValue(stmt, new Map(this.environment));
    this.environment.set(stmt.name, func);
  }

  private executeIfStatement(stmt: IfStatement): void {
    const condition = this.evaluate(stmt.condition);
    
    if (this.isTruthy(condition)) {
      this.executeBlock(stmt.thenBranch);
    } else if (stmt.elseBranch) {
      this.executeBlock(stmt.elseBranch);
    }
  }

  private executeBlock(statements: Statement[]): void {
    const previous = this.environment;
    
    try {
      this.environment = new Map(previous);
      
      for (const statement of statements) {
        this.execute(statement);
      }
    } finally {
      this.environment = previous;
    }
  }

  private evaluate(expr: Expression): Value {
    if (expr instanceof NumberLiteral) {
      return new NumberValue(expr.value);
    }
    
    if (expr instanceof StringLiteral) {
      return new StringValue(expr.value);
    }
    
    if (expr instanceof BooleanLiteral) {
      return new BooleanValue(expr.value);
    }
    
    if (expr instanceof Identifier) {
      const value = this.lookupVariable(expr.name);
      if (!value) {
        throw new Error(`Undefined variable: ${expr.name}`);
      }
      return value;
    }
    
    if (expr instanceof BinaryExpression) {
      return this.evaluateBinaryExpression(expr);
    }
    
    if (expr instanceof FunctionCall) {
      return this.evaluateFunctionCall(expr);
    }
    
    throw new Error(`Unknown expression type: ${expr.constructor.name}`);
  }

  private evaluateBinaryExpression(expr: BinaryExpression): Value {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);
    
    if (left instanceof NumberValue && right instanceof NumberValue) {
      switch (expr.operator) {
        case TokenType.PLUS:
          return new NumberValue(left.value + right.value);
        case TokenType.MINUS:
          return new NumberValue(left.value - right.value);
        case TokenType.MULTIPLY:
          return new NumberValue(left.value * right.value);
        case TokenType.DIVIDE:
            throw new Error('Division by zero');
          }
          return new NumberValue(left.value / right.value);
        case TokenType.GREATER:
          return new BooleanValue(left.value > right.value);
        case TokenType.LESS:
          return new BooleanValue(left.value < right.value);
        case TokenType.EQUAL:
        case TokenType.NOT_EQUAL:
          return new BooleanValue(left.value !== right.value);
      }
    }
    
      return new BooleanValue(this.isEqual(left, right));
    }
    
      return new BooleanValue(!this.isEqual(left, right));
    }
    
    throw new Error(`Invalid binary operation: ${left.constructor.name} ${expr.operator} ${right.constructor.name}`);
  }

  private evaluateFunctionCall(expr: FunctionCall): Value {
    const callee = this.evaluate(expr.callee);
    
    if (!(callee instanceof FunctionValue)) {
      throw new Error('Can only call functions');
    }
    
    const args = expr.args.map(arg => this.evaluate(arg));
    
    if (args.length !== callee.declaration.params.length) {
      throw new Error(`Expected ${callee.declaration.params.length} arguments but got ${args.length}`);
    }
    
    return this.call(callee, args);
  }

  private call(func: FunctionValue, args: Value[]): Value {
    const environment = new Map(func.closure);
    
    for (let i = 0; i < func.declaration.params.length; i++) {
      environment.set(func.declaration.params[i].name, args[i]);
    }
    
    const previous = this.environment;
    
    try {
      this.environment = environment;
      this.executeBlock(func.declaration.body);
      
      // If no explicit return, return 0
      return new NumberValue(0);
    } catch (error) {
      if (error instanceof ReturnException) {
        return error.value;
      }
      throw error;
    } finally {
      this.environment = previous;
    }
  }

  private lookupVariable(name: string): Value | null {
    if (this.environment.has(name)) {
      return this.environment.get(name)!;
    }
    return null;
  }

  private isTruthy(value: Value): boolean {
    if (value instanceof BooleanValue) {
      return value.value;
    }
    if (value instanceof NumberValue) {
      return value.value !== 0;
    }
    return true;
  }

  private isEqual(a: Value, b: Value): boolean {
    if (a instanceof NumberValue && b instanceof NumberValue) {
    }
    if (a instanceof StringValue && b instanceof StringValue) {
    }
    if (a instanceof BooleanValue && b instanceof BooleanValue) {
    }
    return false;
  }
}

class ReturnException extends Error {
  constructor(public value: Value) {
    super();
  }
}

