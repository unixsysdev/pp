// EXAMPLE USAGE

// Example program demonstrating the language features
const exampleProgram = `
fn add(x: number, y: number) -> number {
  x + y;
}

fn factorial(n: number) -> number {
  if (n <= 1) {
    1;
  } else {
    n * factorial(n - 1);
  }
}

let result: number = add(5, 3);
let fact: number = factorial(5);

print(result);
print(fact);
`;

// Run the example
console.log('Enterprise Programming Language Prototype');

const compiler = new Compiler();
compiler.compile(exampleProgram);
