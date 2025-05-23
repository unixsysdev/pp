// Basic test to ensure CI pipeline works
describe('Basic Tests', () => {
  test('math works correctly', () => {
    expect(2 + 2).toBe(4);
  });

  test('string concatenation works', () => {
    expect('hello' + ' world').toBe('hello world');
  });

  test('arrays work correctly', () => {
    const arr = [1, 2, 3];
    expect(arr.length).toBe(3);
    expect(arr[0]).toBe(1);
  });
});
