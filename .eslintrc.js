module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['plugin:@typescript-eslint/recommended'],
  rules: {
    'max-len': ['error', { code: 80 }],
    "indent": ["error", 2],
    'no-console': 'warn',
    '@typescript-eslint/no-var-requires': 'off'
  }
};
