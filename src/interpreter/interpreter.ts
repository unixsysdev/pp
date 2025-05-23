// Enterprise Language Interpreter - Clean Version

import { Statement, Expression, VariableDeclaration, FunctionDeclaration,
         NumberLiteral, StringLiteral, BooleanLiteral, Identifier,
         BinaryExpression, ExpressionStatement } from '../ast/nodes';
import { TokenType } from '../lexer/lexer';

export abstract class Value {
  abstract toString(): string;
}

export class NumberValue extends Value {
  constructor(public value: number) {
    super();
  }
  
  toString(): string {
    return this.value.toString();
  }
}

export class StringValue extends Value {
  constructor(public value: string) {
    super();
  }
  
  toString(): string {
    return this.value;
  }
}

export class BooleanValue extends Value {
  constructor(public value: boolean) {
    super();
  }
  
  toString(): string {
    return this.value.toString();
  }
}

export class FunctionValue extends Value {
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

export class Interpreter {
  private globals = new Map<string, Value>();
  private environment = this.globals;

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
    } else if (stmt instanceof ExpressionStatement) {
      this.evaluate(stmt.expression);
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
      const value = this.environment.get(expr.name);
      if (!value) {
        throw new Error(`Undefined variable: ${expr.name}`);
      }
      return value;
    }
    
    if (expr instanceof BinaryExpression) {
      return this.evaluateBinaryExpression(expr);
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
          if (right.value === 0) {
            throw new Error('Division by zero');
          }
          return new NumberValue(left.value / right.value);
        case TokenType.EQUAL:
          return new BooleanValue(left.value === right.value);
      }
    }
    
    throw new Error(`Invalid binary operation: ${left.constructor.name} ${expr.operator} ${right.constructor.name}`);
  }
}
