// Basic working tests

describe('Basic Functionality', () => {
  test('arithmetic works', () => {
    expect(2 + 2).toBe(4);
    expect(5 - 3).toBe(2);
    expect(3 * 4).toBe(12);
    expect(8 / 2).toBe(4);
  });

  test('strings work', () => {
    expect('hello' + ' world').toBe('hello world');
    expect('test'.length).toBe(4);
  });

  test('booleans work', () => {
    expect(true).toBe(true);
    expect(false).toBe(false);
    expect(!true).toBe(false);
  });

  test('arrays work', () => {
    const arr = [1, 2, 3];
    expect(arr.length).toBe(3);
    expect(arr[0]).toBe(1);
  });
});
