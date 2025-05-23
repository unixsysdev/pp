// STANDARD LIBRARY & BUILT-INS

class StandardLibrary {
  static getBuiltins(): Map<string, Value> {
    const builtins = new Map<string, Value>();
    
    // Built-in print function
    builtins.set('print', new BuiltinFunction('print', 1, (args: Value[]) => {
      console.log(args[0].toString());
      return new NumberValue(0);
    }));
    
    // Built-in input function
    builtins.set('input', new BuiltinFunction('input', 0, () => {
      // In a real implementation, this would read from stdin
      return new StringValue('simulated input');
    }));
    
    // Option creation functions
    builtins.set('Some', new BuiltinFunction('Some', 1, (args: Value[]) => {
      return new OptionValue(args[0]);
    }));
    
    builtins.set('None', new BuiltinFunction('None', 0, () => {
      return new OptionValue(null);
    }));
    
    // Result creation functions
    builtins.set('Ok', new BuiltinFunction('Ok', 1, (args: Value[]) => {
      return new ResultValue(true, args[0]);
    }));
    
    builtins.set('Err', new BuiltinFunction('Err', 1, (args: Value[]) => {
      return new ResultValue(false, args[0]);
    }));
    
    return builtins;
  }
}

class BuiltinFunction extends Value {
  constructor(
    public name: string,
    public arity: number,
    public callable: (args: Value[]) => Value
  ) {
    super();
  }
  
  toString(): string {
    return `<builtin ${this.name}>`;
  }
}

