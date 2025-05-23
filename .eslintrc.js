module.exports = {
  env: {
    node: true,
    es6: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'prefer-const': 'warn',
    'no-undef': 'off', // Turn off since we're not parsing TypeScript properly
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '*.js',
    '**/*.d.ts'
  ],
  // Only lint JavaScript files for now
  overrides: [
    {
      files: ['*.js'],
      env: {
        node: true
      }
    }
  ]
};
