import { ArrayValue, MapValue, StringUtils, MathUtils } from '../../src/stdlib/collections';
import { NumberValue, StringValue } from '../../src/interpreter/interpreter';

describe('Collections', () => {
  describe('ArrayValue', () => {
    test('creates array and performs operations', () => {
      const arr = new ArrayValue([new NumberValue(1), new NumberValue(2), new NumberValue(3)]);
      
      expect(arr.length().value).toBe(3);
      expect(arr.get(0).value?.toString()).toBe('1');
      expect(arr.get(5).value).toBeNull();
      
      arr.push(new NumberValue(4));
      expect(arr.length().value).toBe(4);
      
      const popped = arr.pop();
      expect(popped.value?.toString()).toBe('4');
      expect(arr.length().value).toBe(3);
    });
  });

  describe('MapValue', () => {
    test('creates map and performs operations', () => {
      const map = new MapValue();
      
      map.set('key1', new NumberValue(42));
      map.set('key2', new StringValue('hello'));
      
      expect(map.size().value).toBe(2);
      expect(map.has('key1').value).toBe(true);
      expect(map.has('key3').value).toBe(false);
      
      const value = map.get('key1');
      expect(value.value?.toString()).toBe('42');
    });
  });

  describe('StringUtils', () => {
    test('performs string operations', () => {
      const str = new StringValue('hello,world,test');
      const delimiter = new StringValue(',');
      
      const parts = StringUtils.split(str, delimiter);
      expect(parts.elements.length).toBe(3);
      expect((parts.elements[0] as StringValue).value).toBe('hello');
      
      const joined = StringUtils.join(parts, new StringValue('-'));
      expect(joined.value).toBe('hello-world-test');
    });
  });

  describe('MathUtils', () => {
    test('performs math operations', () => {
      const num = new NumberValue(16);
      const sqrt = MathUtils.sqrt(num);
      
      expect(sqrt.isOk).toBe(true);
      expect((sqrt.value as NumberValue).value).toBe(4);
      
      const negative = new NumberValue(-4);
      const negativeSqrt = MathUtils.sqrt(negative);
      expect(negativeSqrt.isOk).toBe(false);
    });
  });
});
