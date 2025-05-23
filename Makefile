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
