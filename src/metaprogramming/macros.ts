// Phase 7: Metaprogramming and Macro System
// src/metaprogramming/macros.ts
// Phase 7: Metaprogramming and Macro System

import { ASTNode, Expression, Statement, Identifier, FunctionDeclaration, 
         VariableDeclaration, BinaryExpression, NumberLiteral, StringLiteral } from '../ast/nodes';
import { Token, TokenType, Lexer } from '../lexer/lexer';
import { Parser } from '../parser/parser';
import { Type, PrimitiveType } from '../types/types';

// ============================================================================
// MACRO DEFINITION AND EXPANSION
// ============================================================================

export class MacroSystem {
  private macros = new Map<string, Macro>();
  private expansionStack: string[] = [];
  private maxExpansionDepth = 100;

  defineMacro(macro: Macro): void {
    this.macros.set(macro.name, macro);
  }

  expandMacro(name: string, args: MacroArgument[]): ASTNode[] {
    const macro = this.macros.get(name);
    if (!macro) {
      throw new Error(`Undefined macro: ${name}`);
    }

    // Check for recursive expansion
    if (this.expansionStack.includes(name)) {
      throw new Error(`Recursive macro expansion detected: ${this.expansionStack.join(' -> ')} -> ${name}`);
    }

    if (this.expansionStack.length >= this.maxExpansionDepth) {
      throw new Error(`Maximum macro expansion depth exceeded: ${this.maxExpansionDepth}`);
    }

    this.expansionStack.push(name);

    try {
      const expanded = macro.expand(args, this);
      return expanded;
    } finally {
      this.expansionStack.pop();
    }
  }

  getMacro(name: string): Macro | undefined {
    return this.macros.get(name);
  }

  getAllMacros(): Map<string, Macro> {
    return new Map(this.macros);
  }
}

export abstract class Macro {
  constructor(
    public name: string,
    public parameters: MacroParameter[],
    public isHygienic: boolean = true
  ) {}

  abstract expand(args: MacroArgument[], macroSystem: MacroSystem): ASTNode[];

  protected validateArguments(args: MacroArgument[]): void {
    if (args.length !== this.parameters.length) {
      throw new Error(`Macro ${this.name} expects ${this.parameters.length} arguments, got ${args.length}`);
    }

    for (let i = 0; i < args.length; i++) {
      const param = this.parameters[i];
      const arg = args[i];

      if (!this.isArgumentCompatible(param, arg)) {
        throw new Error(`Argument ${i + 1} to macro ${this.name} is incompatible with parameter ${param.name}`);
      }
    }
  }

  private isArgumentCompatible(param: MacroParameter, arg: MacroArgument): boolean {
    switch (param.type) {
      case MacroParameterType.EXPRESSION:
        return arg.type === MacroArgumentType.EXPRESSION;
      case MacroParameterType.STATEMENT:
        return arg.type === MacroArgumentType.STATEMENT;
      case MacroParameterType.IDENTIFIER:
        return arg.type === MacroArgumentType.IDENTIFIER;
      case MacroParameterType.TYPE:
        return arg.type === MacroArgumentType.TYPE;
      case MacroParameterType.TOKEN:
        return arg.type === MacroArgumentType.TOKEN;
      case MacroParameterType.BLOCK:
        return arg.type === MacroArgumentType.BLOCK;
      default:
        return false;
    }
  }
}

export enum MacroParameterType {
  EXPRESSION = 'expr',
  STATEMENT = 'stmt',
  IDENTIFIER = 'ident',
  TYPE = 'type',
  TOKEN = 'token',
  BLOCK = 'block'
}

export interface MacroParameter {
  name: string;
  type: MacroParameterType;
  optional?: boolean;
  repeatable?: boolean;
}

export enum MacroArgumentType {
  EXPRESSION,
  STATEMENT,
  IDENTIFIER,
  TYPE,
  TOKEN,
  BLOCK
}

export interface MacroArgument {
  type: MacroArgumentType;
  value: any;
}

// ============================================================================
// DECLARATIVE MACRO IMPLEMENTATION
// ============================================================================

export class DeclarativeMacro extends Macro {
  constructor(
    name: string,
    parameters: MacroParameter[],
    private template: MacroTemplate,
    isHygienic: boolean = true
  ) {
    super(name, parameters, isHygienic);
  }

  expand(args: MacroArgument[], macroSystem: MacroSystem): ASTNode[] {
    this.validateArguments(args);

    const substitutions = new Map<string, any>();
    for (let i = 0; i < this.parameters.length; i++) {
      substitutions.set(this.parameters[i].name, args[i].value);
    }

    return this.template.instantiate(substitutions, macroSystem, this.isHygienic);
  }
}

export class MacroTemplate {
  constructor(private templateNodes: TemplateNode[]) {}

  instantiate(substitutions: Map<string, any>, macroSystem: MacroSystem, isHygienic: boolean): ASTNode[] {
    const context = new ExpansionContext(substitutions, macroSystem, isHygienic);
    const result: ASTNode[] = [];

    for (const templateNode of this.templateNodes) {
      const expanded = templateNode.expand(context);
      if (Array.isArray(expanded)) {
        result.push(...expanded);
      } else {
        result.push(expanded);
      }
    }

    return result;
  }
}

abstract class TemplateNode {
  abstract expand(context: ExpansionContext): ASTNode | ASTNode[];
}

class LiteralTemplateNode extends TemplateNode {
  constructor(private node: ASTNode) {
    super();
  }

  expand(context: ExpansionContext): ASTNode {
    return this.cloneNode(this.node, context);
  }

  private cloneNode(node: ASTNode, context: ExpansionContext): ASTNode {
    // Deep clone AST node with hygiene handling
    if (node instanceof Identifier) {
      const name = context.isHygienic ? context.makeHygienic(node.name) : node.name;
      return new Identifier(name);
    } else if (node instanceof NumberLiteral) {
      return new NumberLiteral(node.value);
    } else if (node instanceof StringLiteral) {
      return new StringLiteral(node.value);
    } else if (node instanceof BinaryExpression) {
      return new BinaryExpression(
        this.cloneNode(node.left, context) as Expression,
        node.operator,
        this.cloneNode(node.right, context) as Expression
      );
    }
    // Add more node types as needed
    return node;
  }
}

class SubstitutionTemplateNode extends TemplateNode {
  constructor(private parameterName: string) {
    super();
  }

  expand(context: ExpansionContext): ASTNode | ASTNode[] {
    const value = context.getSubstitution(this.parameterName);
    if (Array.isArray(value)) {
      return value;
    }
    return value;
  }
}

class RepetitionTemplateNode extends TemplateNode {
  constructor(
    private pattern: TemplateNode[],
    private separator: string | null,
    private parameterName: string
  ) {
    super();
  }

  expand(context: ExpansionContext): ASTNode[] {
    const values = context.getSubstitution(this.parameterName);
    if (!Array.isArray(values)) {
      throw new Error(`Expected array for repetition parameter ${this.parameterName}`);
    }

    const result: ASTNode[] = [];
    for (let i = 0; i < values.length; i++) {
      const itemContext = context.withItemSubstitution(this.parameterName, values[i]);
      
      for (const patternNode of this.pattern) {
        const expanded = patternNode.expand(itemContext);
        if (Array.isArray(expanded)) {
          result.push(...expanded);
        } else {
          result.push(expanded);
        }
      }

      // Add separator if not last item
      if (this.separator && i < values.length - 1) {
        // Create separator token/node based on separator string
        // This would be implemented based on the specific separator
      }
    }

    return result;
  }
}

class ExpansionContext {
  private hygieneCounter = 0;
  private hygieneMap = new Map<string, string>();

  constructor(
    private substitutions: Map<string, any>,
    private macroSystem: MacroSystem,
    public isHygienic: boolean
  ) {}

  getSubstitution(name: string): any {
    if (!this.substitutions.has(name)) {
      throw new Error(`Undefined macro parameter: ${name}`);
    }
    return this.substitutions.get(name);
  }

  makeHygienic(identifier: string): string {
    if (!this.hygieneMap.has(identifier)) {
      this.hygieneMap.set(identifier, `${identifier}__macro_${this.hygieneCounter++}`);
    }
    return this.hygieneMap.get(identifier)!;
  }

  withItemSubstitution(paramName: string, value: any): ExpansionContext {
    const newSubstitutions = new Map(this.substitutions);
    newSubstitutions.set(paramName, value);
    return new ExpansionContext(newSubstitutions, this.macroSystem, this.isHygienic);
  }
}

// ============================================================================
// PROCEDURAL MACROS
// ============================================================================

export abstract class ProceduralMacro extends Macro {
  constructor(name: string, parameters: MacroParameter[] = []) {
    super(name, parameters, false); // Procedural macros are typically non-hygienic
  }

  abstract generate(args: MacroArgument[], macroSystem: MacroSystem): ASTNode[];

  expand(args: MacroArgument[], macroSystem: MacroSystem): ASTNode[] {
    return this.generate(args, macroSystem);
  }
}

// Example: Derive macro for automatic trait implementation
export class DeriveMacro extends ProceduralMacro {
  constructor() {
    super('derive', [
      { name: 'traits', type: MacroParameterType.IDENTIFIER, repeatable: true }
    ]);
  }

  generate(args: MacroArgument[]): ASTNode[] {
    // This would generate trait implementations based on struct definition
    // For example: derive(Debug, Clone, PartialEq)
    const result: ASTNode[] = [];
    
    for (const arg of args) {
      if (arg.type === MacroArgumentType.IDENTIFIER) {
        const traitName = arg.value;
        const implementation = this.generateTraitImpl(traitName);
        result.push(implementation);
      }
    }

    return result;
  }

  private generateTraitImpl(traitName: string): ASTNode {
    // Generate appropriate trait implementation
    // This is a simplified example
    return new FunctionDeclaration(
      `${traitName.toLowerCase()}_impl`,
      [],
      new PrimitiveType('void'),
      []
    );
  }
}

// ============================================================================
// COMPILE-TIME CODE GENERATION
// ============================================================================

export class CompileTimeEvaluator {
  private constants = new Map<string, any>();

  evaluate(expression: Expression): any {
    if (expression instanceof NumberLiteral) {
      return expression.value;
    } else if (expression instanceof StringLiteral) {
      return expression.value;
    } else if (expression instanceof BinaryExpression) {
      return this.evaluateBinaryExpression(expression);
    } else if (expression instanceof Identifier) {
      return this.constants.get(expression.name);
    }

    throw new Error(`Cannot evaluate expression at compile time: ${expression.constructor.name}`);
  }

  private evaluateBinaryExpression(expr: BinaryExpression): any {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    switch (expr.operator) {
      case '+': return left + right;
      case '-': return left - right;
      case '*': return left * right;
      case '/': return left / right;
      case '==': return left === right;
      case '!=': return left !== right;
      case '<': return left < right;
      case '>': return left > right;
      default:
        throw new Error(`Unsupported compile-time operator: ${expr.operator}`);
    }
  }

  setConstant(name: string, value: any): void {
    this.constants.set(name, value);
  }
}

// ============================================================================
// REFLECTION API
// ============================================================================

export class ReflectionSystem {
  private typeInfo = new Map<string, TypeInfo>();

  registerType(name: string, info: TypeInfo): void {
    this.typeInfo.set(name, info);
  }

  getTypeInfo(name: string): TypeInfo | undefined {
    return this.typeInfo.get(name);
  }

  getAllTypes(): TypeInfo[] {
    return Array.from(this.typeInfo.values());
  }

  generateTypeInfo(node: ASTNode): TypeInfo {
    if (node instanceof FunctionDeclaration) {
      return new FunctionTypeInfo(
        node.name,
        node.params.map(p => ({ name: p.name, type: p.type.toString() })),
        node.returnType.toString()
      );
    }

    throw new Error(`Cannot generate type info for: ${node.constructor.name}`);
  }
}

export abstract class TypeInfo {
  constructor(public name: string, public kind: string) {}

  abstract getMembers(): MemberInfo[];
  abstract hasMethod(name: string): boolean;
  abstract getMethod(name: string): MethodInfo | undefined;
}

export class FunctionTypeInfo extends TypeInfo {
  constructor(
    name: string,
    public parameters: { name: string; type: string }[],
    public returnType: string
  ) {
    super(name, 'function');
  }

  getMembers(): MemberInfo[] {
    return this.parameters.map(p => new MemberInfo(p.name, p.type));
  }

  hasMethod(): boolean {
    return false; // Functions don't have methods
  }

  getMethod(): undefined {
    return undefined;
  }
}

export class MemberInfo {
  constructor(public name: string, public type: string) {}
}

export class MethodInfo {
  constructor(
    public name: string,
    public parameters: { name: string; type: string }[],
    public returnType: string
  ) {}
}

// ============================================================================
// MACRO PARSER EXTENSIONS
// ============================================================================

export class MacroParser extends Parser {
  private macroSystem: MacroSystem;

  constructor(tokens: Token[], macroSystem: MacroSystem) {
    super(tokens);
    this.macroSystem = macroSystem;
  }

  protected parseStatement(): Statement | null {
    // Check for macro invocations
    if (this.checkMacroInvocation()) {
      return this.parseMacroInvocation();
    }

    return super.parseStatement();
  }

  private checkMacroInvocation(): boolean {
    if (this.peek().type === TokenType.IDENTIFIER) {
      const name = this.peek().value;
      return this.macroSystem.getMacro(name) !== undefined;
    }
    return false;
  }

  private parseMacroInvocation(): Statement {
    const macroName = this.advance().value;
    const macro = this.macroSystem.getMacro(macroName)!;

    this.consume(TokenType.LPAREN, "Expected '(' after macro name");

    const args: MacroArgument[] = [];
    if (!this.check(TokenType.RPAREN)) {
      do {
        args.push(this.parseMacroArgument());
      } while (this.match(TokenType.COMMA));
    }

    this.consume(TokenType.RPAREN, "Expected ')' after macro arguments");

    // Expand the macro
    const expandedNodes = this.macroSystem.expandMacro(macroName, args);
    
    // For simplicity, return the first expanded node as a statement
    // In a real implementation, you'd handle multiple nodes appropriately
    return expandedNodes[0] as Statement;
  }

  private parseMacroArgument(): MacroArgument {
    // Try to parse different argument types
    if (this.check(TokenType.IDENTIFIER)) {
      const identifier = this.advance().value;
      return {
        type: MacroArgumentType.IDENTIFIER,
        value: identifier
      };
    } else {
      // Parse as expression
      const expr = this.expression();
      return {
        type: MacroArgumentType.EXPRESSION,
        value: expr
      };
    }
  }
}

// ============================================================================
// BUILT-IN MACROS
// ============================================================================

export class BuiltinMacros {
  static createStandardMacros(): Map<string, Macro> {
    const macros = new Map<string, Macro>();

    // assert! macro
    macros.set('assert', new AssertMacro());

    // println! macro
    macros.set('println', new PrintlnMacro());

    // vec! macro for creating arrays
    macros.set('vec', new VecMacro());

    // format! macro for string formatting
    macros.set('format', new FormatMacro());

    // cfg! macro for conditional compilation
    macros.set('cfg', new CfgMacro());

    return macros;
  }
}

class AssertMacro extends ProceduralMacro {
  constructor() {
    super('assert', [
      { name: 'condition', type: MacroParameterType.EXPRESSION },
      { name: 'message', type: MacroParameterType.EXPRESSION, optional: true }
    ]);
  }

  generate(args: MacroArgument[]): ASTNode[] {
    const condition = args[0].value as Expression;
    const message = args.length > 1 ? args[1].value as Expression : new StringLiteral('Assertion failed');

    // Generate: if (!condition) { panic(message); }
    return [
      new IfStatement(
        condition,
        [], // Empty then branch (assertion passes)
        [
          // Else branch (assertion fails)
          new FunctionCall(
            new Identifier('panic'),
            [message]
          ) as any // Cast to Statement for simplicity
        ]
      )
    ];
  }
}

class PrintlnMacro extends ProceduralMacro {
  constructor() {
    super('println', [
      { name: 'args', type: MacroParameterType.EXPRESSION, repeatable: true }
    ]);
  }

  generate(args: MacroArgument[]): ASTNode[] {
    // Generate print calls for each argument
    const statements: ASTNode[] = [];
    
    for (const arg of args) {
      statements.push(
        new FunctionCall(
          new Identifier('print'),
          [arg.value as Expression]
        ) as any
      );
    }

    // Add newline
    statements.push(
      new FunctionCall(
        new Identifier('print'),
        [new StringLiteral('\n')]
      ) as any
    );

    return statements;
  }
}

class VecMacro extends ProceduralMacro {
  constructor() {
    super('vec', [
      { name: 'elements', type: MacroParameterType.EXPRESSION, repeatable: true }
    ]);
  }

  generate(args: MacroArgument[]): ASTNode[] {
    // Generate array creation with elements
    const elements = args.map(arg => arg.value as Expression);
    
    // This would create an array literal in a real implementation
    return [
      new FunctionCall(
        new Identifier('Array.create'),
        elements
      ) as any
    ];
  }
}

class FormatMacro extends ProceduralMacro {
  constructor() {
    super('format', [
      { name: 'format_string', type: MacroParameterType.EXPRESSION },
      { name: 'args', type: MacroParameterType.EXPRESSION, repeatable: true }
    ]);
  }

  generate(args: MacroArgument[]): ASTNode[] {
    const formatString = args[0].value as Expression;
    const formatArgs = args.slice(1).map(arg => arg.value as Expression);

    return [
      new FunctionCall(
        new Identifier('string_format'),
        [formatString, ...formatArgs]
      ) as any
    ];
  }
}

class CfgMacro extends ProceduralMacro {
  constructor() {
    super('cfg', [
      { name: 'condition', type: MacroParameterType.IDENTIFIER }
    ]);
  }

  generate(args: MacroArgument[]): ASTNode[] {
    const condition = args[0].value as string;
    
    // Check compile-time configuration
    const isEnabled = this.checkConfig(condition);
    
    return [
      new BooleanLiteral(isEnabled) as any
    ];
  }

  private checkConfig(condition: string): boolean {
    // In a real implementation, this would check build configuration
    const configs = process.env.EL_CONFIG?.split(',') || [];
    return configs.includes(condition);
  }
}

// ============================================================================
// MACRO UTILITIES
// ============================================================================

export class MacroUtils {
  static createIdentifier(name: string): MacroArgument {
    return {
      type: MacroArgumentType.IDENTIFIER,
      value: name
    };
  }

  static createExpression(expr: Expression): MacroArgument {
    return {
      type: MacroArgumentType.EXPRESSION,
      value: expr
    };
  }

  static createStatement(stmt: Statement): MacroArgument {
    return {
      type: MacroArgumentType.STATEMENT,
      value: stmt
    };
  }

  static createBlock(statements: Statement[]): MacroArgument {
    return {
      type: MacroArgumentType.BLOCK,
      value: statements
    };
  }

  static parseTemplate(templateString: string): MacroTemplate {
    // Parse macro template string into template nodes
    const lexer = new Lexer(templateString);
    const tokens = lexer.tokenize();
    const templateNodes: TemplateNode[] = [];

    let i = 0;
    while (i < tokens.length) {
      const token = tokens[i];
      
      if (token.type === TokenType.IDENTIFIER && token.value.startsWith(')) {
        // Substitution parameter
        const paramName = token.value.substring(1);
        templateNodes.push(new SubstitutionTemplateNode(paramName));
      } else {
        // Literal token - would need to convert back to AST node
        // This is simplified for the example
      }
      
      i++;
    }

    return new MacroTemplate(templateNodes);
  }
}
