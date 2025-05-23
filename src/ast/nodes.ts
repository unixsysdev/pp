// Enterprise Language AST Nodes - Clean Version

import { Type } from '../types/types';
import { TokenType } from '../lexer/lexer';

export abstract class ASTNode {}

export abstract class Expression extends ASTNode {
  type?: Type;
}

export abstract class Statement extends ASTNode {}

export class NumberLiteral extends Expression {
  constructor(public value: number) {
    super();
  }
}

export class StringLiteral extends Expression {
  constructor(public value: string) {
    super();
  }
}

export class BooleanLiteral extends Expression {
  constructor(public value: boolean) {
    super();
  }
}

export class Identifier extends Expression {
  constructor(public name: string) {
    super();
  }
}

export class BinaryExpression extends Expression {
  constructor(
    public left: Expression,
    public operator: TokenType,
    public right: Expression
  ) {
    super();
  }
}

export class FunctionCall extends Expression {
  constructor(public callee: Expression, public args: Expression[]) {
    super();
  }
}

export class VariableDeclaration extends Statement {
  constructor(
    public name: string,
    public typeAnnotation: Type | null,
    public initializer: Expression | null,
    public isConst: boolean = false
  ) {
    super();
  }
}

export class FunctionDeclaration extends Statement {
  constructor(
    public name: string,
    public params: { name: string; type: Type }[],
    public returnType: Type,
    public body: Statement[]
  ) {
    super();
  }
}

export class IfStatement extends Statement {
  constructor(
    public condition: Expression,
    public thenBranch: Statement[],
    public elseBranch: Statement[] | null = null
  ) {
    super();
  }
}

export class ReturnStatement extends Statement {
  constructor(public value: Expression | null) {
    super();
  }
}

export class ExpressionStatement extends Statement {
  constructor(public expression: Expression) {
    super();
  }
}
