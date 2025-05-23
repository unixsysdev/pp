// Factorial example in Enterprise Lang
fn factorial(n: number) -> number {
    if (n <= 1) {
        1;
    } else {
        n * factorial(n - 1);
    }
}

let result: number = factorial(5);
print(result);
