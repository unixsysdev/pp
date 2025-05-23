import { Lexer, TokenType } from '../../src/lexer/lexer';

describe('Lexer', () => {
  test('tokenizes numbers', () => {
    const lexer = new Lexer('42 3.14');
    const tokens = lexer.tokenize();
    
    expect(tokens[0].type).toBe(TokenType.NUMBER);
    expect(tokens[0].value).toBe('42');
    expect(tokens[1].type).toBe(TokenType.NUMBER);
    expect(tokens[1].value).toBe('3.14');
  });

  test('tokenizes identifiers and keywords', () => {
    const lexer = new Lexer('let x = 42');
    const tokens = lexer.tokenize();
    
    expect(tokens[0].type).toBe(TokenType.LET);
    expect(tokens[1].type).toBe(TokenType.IDENTIFIER);
    expect(tokens[1].value).toBe('x');
    expect(tokens[2].type).toBe(TokenType.ASSIGN);
    expect(tokens[3].type).toBe(TokenType.NUMBER);
  });
});
