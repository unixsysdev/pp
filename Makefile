.PHONY: build test clean install dev

# Build the project
build:
	npm run build

# Install dependencies
install:
	npm install

# Run in development mode
dev:
	npm run dev

# Run tests
test:
	npm test

# Clean build artifacts
clean:
	rm -rf dist/ node_modules/

# Format code
format:
	npm run format

# Lint code
lint:
	npm run lint

# Run example programs
examples:
	npm run dev examples/factorial.el
	npm run dev examples/fibonacci.el

# Initialize git repository
git-init:
	git init
	git add .
	git commit -m "Initial commit: Enterprise Programming Language prototype"

# Advanced build targets

# Install enhanced dependencies
install-dev:
	npm install --save-dev @types/vscode vscode-languageserver vscode-languageserver-textdocument

# Run advanced tests
test-all:
	npm test -- --coverage tests/stdlib tests/concurrency tests/package

# Format code
format-check:
	npm run format -- --check

# Run linter with advanced rules
lint-strict:
	npm run lint -- --max-warnings 0

# Build LLVM backend (requires LLVM installed)
build-llvm:
	npm run compile examples/compilation/hello.el hello_world

# Run language server
lsp:
	ts-node tools/lsp/server.ts

# Run package manager commands
package-demo:
	npm run package:build compile
	npm run package:build test

# Run all async examples
examples-async:
	npm run dev examples/async/promises.el
	npm run dev examples/async/actors.el

# Run all macro examples
examples-macros:
	npm run dev examples/macros/basic.el
	npm run dev examples/macros/derive.el

# Performance benchmarks
benchmark:
	@echo "Running performance benchmarks..."
	time npm run dev examples/fibonacci.el
	time npm run dev examples/factorial.el

# Generate documentation
docs:
	@echo "Generating documentation..."
	mkdir -p docs/generated
	typedoc --out docs/generated src/

# Clean all build artifacts
clean-all: clean
	rm -rf docs/generated coverage/

# Full development setup
setup-dev: install install-dev
	@echo "Development environment ready!"
	@echo "Available commands:"
	@echo "  make examples-async    - Run async examples"
	@echo "  make examples-macros   - Run macro examples"
	@echo "  make test-all         - Run comprehensive tests"
	@echo "  make build-llvm       - Build with LLVM backend"
	@echo "  make lsp              - Start language server"
	@echo "  make docs             - Generate documentation"
