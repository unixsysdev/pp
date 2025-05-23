// Enterprise Language Main Compiler - Clean Version

import { Lexer } from './lexer/lexer';
import { Parser } from './parser/parser';
import { Interpreter } from './interpreter/interpreter';

export class Compiler {
  compile(source: string): void {
    console.log('=== COMPILING ===');
    
    // Lexing
    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();
    console.log('Tokens generated:', tokens.length);
    
    // Parsing
    const parser = new Parser(tokens);
    const ast = parser.parse();
    console.log('AST nodes generated:', ast.length);
    
    // Interpreting
    const interpreter = new Interpreter();
    interpreter.interpret(ast);
  }
}

// Example usage
const exampleProgram = `
fn add(x: number; y: number) -> number {
  x + y;
}

let result: number = 5 + 3;
`;

if (require.main === module) {
  console.log('Enterprise Programming Language Compiler');
  console.log('========================================');
  
  const compiler = new Compiler();
  compiler.compile(exampleProgram);
}
