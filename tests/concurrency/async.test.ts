import { PromiseValue, Channel, STMValue, STM, Transaction } from '../../src/concurrency/async';
import { NumberValue, StringValue } from '../../src/interpreter/interpreter';

describe('Concurrency', () => {
  describe('PromiseValue', () => {
    test('resolves promise', async () => {
      const promise = PromiseValue.resolve(new NumberValue(42));
      const result = await new Promise(resolve => {
        promise.then(value => resolve(value));
      });
      
      expect((result as NumberValue).value).toBe(42);
    });

    test('handles promise rejection', async () => {
      const promise = PromiseValue.reject(new StringValue('error'));
      const result = await new Promise(resolve => {
        promise.catch(error => resolve(error));
      });
      
      expect((result as StringValue).value).toBe('error');
    });
  });

  describe('Channel', () => {
    test('sends and receives values', async () => {
      const channel = new Channel<NumberValue>(2);
      
      await channel.send(new NumberValue(1));
      await channel.send(new NumberValue(2));
      
      const value1 = await channel.receive();
      const value2 = await channel.receive();
      
      expect(value1.value).toBe(1);
      expect(value2.value).toBe(2);
    });
  });

  describe('STM', () => {
    test('performs atomic transactions', async () => {
      const counter = new STMValue(new NumberValue(0));
      
      const result = await STM.atomically((transaction) => {
        const current = counter.read(transaction);
        const newValue = new NumberValue(current.value + 1);
        counter.write(transaction, newValue);
        return newValue;
      });
      
      expect(result.value).toBe(1);
    });
  });
});
