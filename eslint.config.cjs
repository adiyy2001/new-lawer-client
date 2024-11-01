const prettier = require('eslint-plugin-prettier');
const configPrettier = require('eslint-config-prettier');

module.exports = {
  overrides: [
    {
      files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
      languageOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
      },
      plugins: {
        prettier,
      },
      extends: [
        'plugin:prettier/recommended', 
        'eslint:recommended',
        configPrettier, 
      ],
      rules: {
        'prettier/prettier': 'error', 
        'semi': ['warn', 'always'],
        'quotes': ['warn', 'single'],
      },
    },
  ],
};
