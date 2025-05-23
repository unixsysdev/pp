.PHONY: build test clean install dev lint format

# Install dependencies
install:
	npm install

# Build the project
build:
	npm run build

# Run tests
test:
	npm test

# Run in development mode
dev:
	npm run dev

# Lint code
lint:
	npm run lint

# Format code
format:
	npm run format

# Clean build artifacts
clean:
	rm -rf dist/ node_modules/ coverage/

# Full setup
setup: install build test
	@echo "✅ Enterprise Language setup complete!"

# Run examples
examples:
	@echo "Running examples..."
	npm run dev examples/simple.el
	npm run dev examples/factorial.el

# Type check
typecheck:
	npx tsc --noEmit

# CI simulation
ci: install typecheck lint test build
	@echo "✅ CI simulation passed!"

# Development setup
dev-setup: install
	@echo "🚀 Development environment ready!"
	@echo "Commands available:"
	@echo "  make build    - Build the project"
	@echo "  make test     - Run tests"
	@echo "  make examples - Run example programs"
	@echo "  make ci       - Simulate CI pipeline"
