import { Lexer, TokenType } from '../src/lexer/lexer';

describe('Lexer', () => {
  test('tokenizes numbers', () => {
    const lexer = new Lexer('42 3.14');
    const tokens = lexer.tokenize();
    
    expect(tokens[0].type).toBe(TokenType.NUMBER);
    expect(tokens[0].value).toBe('42');
    expect(tokens[1].type).toBe(TokenType.NUMBER);
    expect(tokens[1].value).toBe('3.14');
  });

  test('tokenizes keywords', () => {
    const lexer = new Lexer('let fn if');
    const tokens = lexer.tokenize();
    
    expect(tokens[0].type).toBe(TokenType.LET);
    expect(tokens[1].type).toBe(TokenType.FN);
    expect(tokens[2].type).toBe(TokenType.IF);
  });

  test('tokenizes operators', () => {
    const lexer = new Lexer('+ - * / =');
    const tokens = lexer.tokenize();
    
    expect(tokens[0].type).toBe(TokenType.PLUS);
    expect(tokens[1].type).toBe(TokenType.MINUS);
    expect(tokens[2].type).toBe(TokenType.MULTIPLY);
    expect(tokens[3].type).toBe(TokenType.DIVIDE);
    expect(tokens[4].type).toBe(TokenType.ASSIGN);
  });
});
