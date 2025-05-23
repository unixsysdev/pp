# Enterprise Programming Language

A modern, statically-typed programming language designed for enterprise applications.

## Current Status

🟢 **Phase 1-2: Core Implementation**
- ✅ Lexer and tokenization
- ✅ Parser and AST generation
- ✅ Basic type system
- ✅ Simple interpreter
- ✅ Basic error handling

🟡 **Phase 3-7: Advanced Features (In Development)**
- 🚧 Enhanced standard library
- 🚧 Concurrency primitives
- 🚧 Package manager
- 🚧 LLVM code generation
- 🚧 Metaprogramming system

## Quick Start

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Try the compiler
npm run dev examples/simple.el
```

## Language Syntax

```rust
// Function definition
fn add(x: number; y: number) -> number {
    x + y;
}

// Variable declaration
let result: number = add(5, 3);

// Boolean expressions
if result == 8 {
    // success
}
```

## Project Structure

```
src/
├── lexer/          # Tokenization
├── parser/         # Syntax analysis
├── types/          # Type system
├── ast/            # Abstract syntax tree
├── interpreter/    # Runtime execution
└── compiler.ts     # Main compiler
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests with coverage
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## Examples

Check the `examples/` directory for sample programs:
- `simple.el` - Basic arithmetic
- `factorial.el` - Recursive functions

## Contributing

This is an educational compiler project. Feel free to explore and experiment!

## License

MIT License
