// Fibonacci example with memoization
fn fibonacci(n: number) -> number {
    if (n <= 1) {
        n;
    } else {
        fibonacci(n - 1) + fibonacci(n - 2);
    }
}

let fib10: number = fibonacci(10);
print(fib10);
