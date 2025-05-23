// Factorial example
fn factorial(n: number) -> number {
  if n == 0 {
    1;
  } else {
    n * factorial(n - 1);
  }
}

let result: number = factorial(5);
