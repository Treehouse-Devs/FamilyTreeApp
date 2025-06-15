import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'
import pluginUnusedImports from 'eslint-plugin-unused-imports'
import pluginImport from 'eslint-plugin-import'
import pluginReact from 'eslint-plugin-react'
import pluginReactNative from 'eslint-plugin-react-native'
import pluginNode from 'eslint-plugin-node'
import pluginJsdoc from 'eslint-plugin-jsdoc'
import * as path from 'path'
import tsParser from '@typescript-eslint/parser'

const plugins = {
  '@typescript-eslint': tseslint.plugin,
  'unused-imports': pluginUnusedImports,
  import: pluginImport,
  react: pluginReact,
  'react-native': pluginReactNative,
  node: pluginNode,
  jsdoc: pluginJsdoc,
}

const rules = {
  'unused-imports/no-unused-imports': 'warn',
  '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  '@typescript-eslint/unbound-method': 'off',
  'node/no-unsupported-features/es-syntax': 'off',
  'node/no-missing-import': 'off',
  'react-native/no-inline-styles': 'off',
}

export default [
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', 'eslint.config.js'],
  },

  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    semi: false,
    jsx: true,
  }),

  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: path.resolve(),
        sourceType: 'module',
      },
    },
    plugins,
    rules,
  },
  {
    files: ['apps/frontend/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./apps/frontend/tsconfig.json'],
        tsconfigRootDir: path.resolve(),
        sourceType: 'module',
      },
    },
  },
  {
    files: ['apps/backend/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./apps/backend/tsconfig.json'],
        tsconfigRootDir: path.resolve(),
        sourceType: 'module',
      },
    },
  },
]
