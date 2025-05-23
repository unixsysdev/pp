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

