# Enterprise Programming Language

A modern, statically-typed programming language designed for enterprise applications with advanced type safety, memory management, and concurrency features.

## Features

- **Strong Static Typing**: Type inference with explicit type annotations
- **Memory Safety**: Compile-time guarantees and pluggable memory management
- **Error Handling**: Result/Option types for safe error handling
- **Concurrency**: Built-in async/await and actor model support
- **Performance**: Zero-cost abstractions and LLVM backend (planned)
- **Tooling**: Comprehensive development tools and IDE support

## Project Structure

```
src/
├── lexer/          # Tokenization and lexical analysis
├── parser/         # Syntax analysis and AST generation
├── types/          # Type system implementation
├── ast/            # Abstract syntax tree definitions
├── checker/        # Static type checking
├── interpreter/    # Runtime execution engine
├── stdlib/         # Standard library and built-ins
└── compiler.ts     # Main compiler driver
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Run examples:
```bash
npm run dev
```

4. Run tests:
```bash
npm test
```

## Language Syntax Example

```rust
fn fibonacci(n: number) -> number {
    if (n <= 1) {
        n;
    } else {
        fibonacci(n - 1) + fibonacci(n - 2);
    }
}

let result: Option<number> = Some(fibonacci(10));
match result {
    Some(value) => print(value),
    None => print("No value")
}
```

## Development Roadmap

- [x] Phase 1: Lexer, parser, and basic type checking
- [x] Phase 2: Interpreter for simple programs
- [x] Phase 3: Standard library expansion
- [x] Phase 4: Advanced concurrency primitives
- [x] Phase 5: Package manager and build tools
- [x] Phase 6: LLVM code generation
- [x] Phase 7: Metaprogramming and macros
- [ ] Phase 8: Performance optimizations
- [ ] Phase 9: Enterprise tooling and IDE support
- [ ] Phase 10: Production ecosystem

## Contributing

This is a prototype implementation. Contributions are welcome!

## License

MIT License - see LICENSE file for details.

## New Features (Phases 3-7)

### Phase 3: Enhanced Standard Library
- **Collections**: Dynamic arrays, hash maps, and set operations
- **String Utilities**: Split, join, substring, and formatting functions
- **Math Library**: Mathematical functions, random number generation
- **I/O Operations**: File reading/writing, console I/O
- **JSON Support**: Parsing and serialization
- **Time Utilities**: Date/time manipulation and formatting

### Phase 4: Advanced Concurrency
- **Async/Await**: Promise-based asynchronous programming
- **Actor Model**: Isolated state with message passing
- **Channels**: CSP-style communication primitives
- **Software Transactional Memory**: Lock-free concurrent programming
- **Work-Stealing Scheduler**: Efficient task distribution
- **Fiber Support**: Cooperative multitasking

### Phase 5: Package Manager & Build Tools
- **Package Registry**: Publish and install packages
- **Semantic Versioning**: Dependency resolution with SemVer
- **Build System**: Incremental compilation and task automation
- **Workspace Management**: Multi-package project support
- **Hot Reloading**: Development-time code reloading

### Phase 6: LLVM Code Generation
- **Native Compilation**: Compile to native machine code
- **Optimization Passes**: Dead code elimination, constant folding
- **Cross-Platform**: Support for multiple target architectures
- **Performance**: Zero-cost abstractions and aggressive optimization

### Phase 7: Metaprogramming & Macros
- **Hygienic Macros**: Safe macro expansion with name resolution
- **Procedural Macros**: Custom code generation at compile time
- **Reflection API**: Runtime type information and introspection
- **Compile-Time Evaluation**: Constant folding and optimization
- **Built-in Macros**: assert!, println!, vec!, format!, cfg!

## Advanced Examples

### Concurrent Programming
```rust
// Actor-based concurrent counter
actor Counter {
    let mut value: number = 0;
    
    fn increment() -> number {
        value = value + 1;
        value
    }
    
    fn get() -> number {
        value
    }
}

async fn main() -> void {
    let counter = spawn_actor(Counter);
    
    // Concurrent increments
    let tasks = [
        async { counter.send(increment()) },
        async { counter.send(increment()) },
        async { counter.send(increment()) }
    ];
    
    await Promise.all(tasks);
    let final_value = await counter.send(get());
    println!("Final count: {}", final_value);
}
```

### Macro Usage
```rust
// Custom derive macro
#[derive(Debug, Clone, PartialEq, Serialize)]
struct User {
    id: number,
    name: string,
    email: string
}

// Vector creation macro
let numbers = vec![1, 2, 3, 4, 5];

// Assertion macro
assert!(numbers.length() == 5, "Vector should have 5 elements");

// Format macro
let message = format!("User {} has email {}", user.name, user.email);
```

### Package Management
```bash
# Install packages
elpm install json-parser ^1.2.0
elpm install async-http ~2.1.0

# Build project
elpm build compile
elpm build test
elpm build package

# Publish package
elpm publish
```

## Language Syntax Reference

### Type System
```rust
// Basic types
let num: number = 42.0;
let text: string = "Hello, World!";
let flag: boolean = true;

// Option types (null safety)
let maybe_value: Option<number> = Some(42);
let no_value: Option<number> = None;

// Result types (error handling)
fn divide(a: number, b: number) -> Result<number, string> {
    if (b == 0) {
        Err("Division by zero")
    } else {
        Ok(a / b)
    }
}

// Pattern matching
match divide(10, 2) {
    Ok(result) => println!("Result: {}", result),
    Err(error) => println!("Error: {}", error)
}
```

### Async Programming
```rust
// Async function
async fn fetch_user(id: number) -> Result<User, string> {
    let response = await Http.get("/users/" + id.toString());
    match response {
        Ok(data) => Json.parse<User>(data),
        Err(e) => Err("Failed to fetch user")
    }
}

// Channel communication
fn producer_consumer() -> void {
    let channel = Channel.new<number>(10);
    
    // Producer
    spawn(async {
        for i in 0..100 {
            await channel.send(i);
        }
        channel.close();
    });
    
    // Consumer
    spawn(async {
        while let Some(value) = await channel.receive() {
            println!("Received: {}", value);
        }
    });
}
```

### Collections and Utilities
```rust
// Arrays with functional operations
let numbers = [1, 2, 3, 4, 5];
let doubled = numbers.map(|x| x * 2);
let evens = numbers.filter(|x| x % 2 == 0);
let sum = numbers.reduce(0, |acc, x| acc + x);

// Hash maps
let mut scores = Map.new<string, number>();
scores.set("Alice", 95);
scores.set("Bob", 87);

match scores.get("Alice") {
    Some(score) => println!("Alice's score: {}", score),
    None => println!("Alice not found")
}

// String operations
let text = "Hello, World!";
let parts = text.split(", ");
let upper = text.toUpperCase();
let substring = text.substring(0, 5);
```

## New Features (Phases 3-7)

### Phase 3: Enhanced Standard Library
- **Collections**: Dynamic arrays, hash maps, and set operations
- **String Utilities**: Split, join, substring, and formatting functions
- **Math Library**: Mathematical functions, random number generation
- **I/O Operations**: File reading/writing, console I/O
- **JSON Support**: Parsing and serialization
- **Time Utilities**: Date/time manipulation and formatting

### Phase 4: Advanced Concurrency
- **Async/Await**: Promise-based asynchronous programming
- **Actor Model**: Isolated state with message passing
- **Channels**: CSP-style communication primitives
- **Software Transactional Memory**: Lock-free concurrent programming
- **Work-Stealing Scheduler**: Efficient task distribution
- **Fiber Support**: Cooperative multitasking

### Phase 5: Package Manager & Build Tools
- **Package Registry**: Publish and install packages
- **Semantic Versioning**: Dependency resolution with SemVer
- **Build System**: Incremental compilation and task automation
- **Workspace Management**: Multi-package project support
- **Hot Reloading**: Development-time code reloading

### Phase 6: LLVM Code Generation
- **Native Compilation**: Compile to native machine code
- **Optimization Passes**: Dead code elimination, constant folding
- **Cross-Platform**: Support for multiple target architectures
- **Performance**: Zero-cost abstractions and aggressive optimization

### Phase 7: Metaprogramming & Macros
- **Hygienic Macros**: Safe macro expansion with name resolution
- **Procedural Macros**: Custom code generation at compile time
- **Reflection API**: Runtime type information and introspection
- **Compile-Time Evaluation**: Constant folding and optimization
- **Built-in Macros**: assert!, println!, vec!, format!, cfg!

## Advanced Examples

### Concurrent Programming
```rust
// Actor-based concurrent counter
actor Counter {
    let mut value: number = 0;
    
    fn increment() -> number {
        value = value + 1;
        value
    }
    
    fn get() -> number {
        value
    }
}

async fn main() -> void {
    let counter = spawn_actor(Counter);
    
    // Concurrent increments
    let tasks = [
        async { counter.send(increment()) },
        async { counter.send(increment()) },
        async { counter.send(increment()) }
    ];
    
    await Promise.all(tasks);
    let final_value = await counter.send(get());
    println!("Final count: {}", final_value);
}
```

### Macro Usage
```rust
// Custom derive macro
#[derive(Debug, Clone, PartialEq, Serialize)]
struct User {
    id: number,
    name: string,
    email: string
}

// Vector creation macro
let numbers = vec![1, 2, 3, 4, 5];

// Assertion macro
assert!(numbers.length() == 5, "Vector should have 5 elements");

// Format macro
let message = format!("User {} has email {}", user.name, user.email);
```

### Package Management
```bash
# Install packages
elpm install json-parser ^1.2.0
elpm install async-http ~2.1.0

# Build project
elpm build compile
elpm build test
elpm build package

# Publish package
elpm publish
```

## Language Syntax Reference

### Type System
```rust
// Basic types
let num: number = 42.0;
let text: string = "Hello, World!";
let flag: boolean = true;

// Option types (null safety)
let maybe_value: Option<number> = Some(42);
let no_value: Option<number> = None;

// Result types (error handling)
fn divide(a: number, b: number) -> Result<number, string> {
    if (b == 0) {
        Err("Division by zero")
    } else {
        Ok(a / b)
    }
}

// Pattern matching
match divide(10, 2) {
    Ok(result) => println!("Result: {}", result),
    Err(error) => println!("Error: {}", error)
}
```

### Async Programming
```rust
// Async function
async fn fetch_user(id: number) -> Result<User, string> {
    let response = await Http.get("/users/" + id.toString());
    match response {
        Ok(data) => Json.parse<User>(data),
        Err(e) => Err("Failed to fetch user")
    }
}

// Channel communication
fn producer_consumer() -> void {
    let channel = Channel.new<number>(10);
    
    // Producer
    spawn(async {
        for i in 0..100 {
            await channel.send(i);
        }
        channel.close();
    });
    
    // Consumer
    spawn(async {
        while let Some(value) = await channel.receive() {
            println!("Received: {}", value);
        }
    });
}
```

### Collections and Utilities
```rust
// Arrays with functional operations
let numbers = [1, 2, 3, 4, 5];
let doubled = numbers.map(|x| x * 2);
let evens = numbers.filter(|x| x % 2 == 0);
let sum = numbers.reduce(0, |acc, x| acc + x);

// Hash maps
let mut scores = Map.new<string, number>();
scores.set("Alice", 95);
scores.set("Bob", 87);

match scores.get("Alice") {
    Some(score) => println!("Alice's score: {}", score),
    None => println!("Alice not found")
}

// String operations
let text = "Hello, World!";
let parts = text.split(", ");
let upper = text.toUpperCase();
let substring = text.substring(0, 5);
```
