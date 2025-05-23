// MAIN COMPILER DRIVER

class Compiler {
  compile(source: string): void {
    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();
    console.log('Tokens:', tokens.map(t => `${t.type}(${t.value})`).join(' '));
    
    const parser = new Parser(tokens);
    const ast = parser.parse();
    console.log('AST:', this.astToString(ast));
    
    const typeChecker = new TypeChecker();
    typeChecker.typeCheck(ast);
    console.log('Type checking passed!');
    
    const interpreter = new Interpreter();
    
    // Add built-in functions
    const builtins = StandardLibrary.getBuiltins();
    for (const [name, value] of builtins) {
      interpreter['globals'].set(name, value);
    }
    
    interpreter.interpret(ast);
  }

  private astToString(nodes: ASTNode[]): string {
    return nodes.map(node => this.nodeToString(node)).join('\n');
  }

  private nodeToString(node: ASTNode, indent = 0): string {
    const spaces = '  '.repeat(indent);
    
    if (node instanceof VariableDeclaration) {
      const type = node.typeAnnotation ? `: ${node.typeAnnotation.toString()}` : '';
      const init = node.initializer ? ` = ${this.nodeToString(node.initializer)}` : '';
      return `${spaces}${node.isConst ? 'const' : 'let'} ${node.name}${type}${init}`;
    }
    
    if (node instanceof FunctionDeclaration) {
      const params = node.params.map(p => `${p.name}: ${p.type.toString()}`).join(', ');
      return `${spaces}fn ${node.name}(${params}) -> ${node.returnType.toString()}`;
    }
    
    if (node instanceof NumberLiteral) {
      return node.value.toString();
    }
    
    if (node instanceof StringLiteral) {
      return `"${node.value}"`;
    }
    
    if (node instanceof BooleanLiteral) {
      return node.value.toString();
    }
    
    if (node instanceof Identifier) {
      return node.name;
    }
    
    if (node instanceof BinaryExpression) {
      return `(${this.nodeToString(node.left)} ${node.operator} ${this.nodeToString(node.right)})`;
    }
    
    return node.constructor.name;
  }
}

