import { ASTNode, Statement, Expression } from '../../src/ast/nodes';

export class CodeFormatter {
  private indentLevel = 0;
  private indentSize = 2;

  format(statements: Statement[]): string {
    return statements.map(stmt => this.formatStatement(stmt)).join('\n');
  }

  private formatStatement(stmt: Statement): string {
    const indent = ' '.repeat(this.indentLevel * this.indentSize);
    
    if (stmt instanceof FunctionDeclaration) {
      return this.formatFunction(stmt, indent);
    } else if (stmt instanceof VariableDeclaration) {
      return this.formatVariable(stmt, indent);
    }
    
    return indent + stmt.toString();
  }

  private formatFunction(func: FunctionDeclaration, indent: string): string {
    const params = func.params.map(p => `${p.name}: ${p.type.toString()}`).join(', ');
    const header = `${indent}fn ${func.name}(${params}) -> ${func.returnType.toString()} {`;
    
    this.indentLevel++;
    const body = func.body.map(stmt => this.formatStatement(stmt)).join('\n');
    this.indentLevel--;
    
    const footer = `${indent}}`;
    
    return [header, body, footer].join('\n');
  }

  private formatVariable(variable: VariableDeclaration, indent: string): string {
    const keyword = variable.isConst ? 'const' : 'let';
    const type = variable.typeAnnotation ? `: ${variable.typeAnnotation.toString()}` : '';
    const init = variable.initializer ? ` = ${this.formatExpression(variable.initializer)}` : '';
    
    return `${indent}${keyword} ${variable.name}${type}${init};`;
  }

  private formatExpression(expr: Expression): string {
    // Simplified expression formatting
    return expr.toString();
  }
}
