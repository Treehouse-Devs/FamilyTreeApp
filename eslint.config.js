import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'
import pluginUnusedImports from 'eslint-plugin-unused-imports'
import pluginImport from 'eslint-plugin-import'
import pluginReact from 'eslint-plugin-react'
import pluginReactNative from 'eslint-plugin-react-native'
import pluginNode from 'eslint-plugin-node'
import pluginJsdoc from 'eslint-plugin-jsdoc'
import pluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
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
  '@typescript-eslint/consistent-type-imports': [
    'error',
    { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
  ],
  'node/no-unsupported-features/es-syntax': 'off',
  'node/no-missing-import': 'off',
  'react-native/no-inline-styles': 'off',
  '@stylistic/padding-line-between-statements': [
    'error',
    { blankLine: 'always', prev: '*', next: 'return' },
  ],
}

export default [
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', 'eslint.config.js', 'apps/frontend/components/ui/**'],
  },

  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    semi: false,
    jsx: true,
    braceStyle: '1tbs'
  }),

  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        projectService: ['./tsconfig.json'],
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

  // --- apps/frontend-vue -----------------------------------------------------
  // The Vue app keeps the same house style (single quotes, no semicolons, 2-space,
  // separate type imports, blank line before return) — only the parser changes, so
  // that <template> blocks are understood and <script setup> is type-aware.
  {
    files: ['apps/frontend-vue/**/*.{ts,vue}'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        project: ['./apps/frontend-vue/tsconfig.json'],
        tsconfigRootDir: path.resolve(),
        extraFileExtensions: ['.vue'],
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
    },
    plugins: { ...plugins, vue: pluginVue },
    rules: {
      ...rules,
      ...pluginVue.configs['flat/recommended']
        .reduce((acc, config) => ({ ...acc, ...config.rules }), {}),
      // Single-word component filenames are conventional for pages and layouts
      // here (TreePage.vue, AppShell.vue), and the directory already scopes them.
      'vue/multi-word-component-names': 'off',
      // Conflicts with @stylistic's indent handling inside <template>.
      'vue/html-indent': ['error', 2],
      // The repo writes compact multi-attribute JSX today; forcing one attribute
      // per line would make the Vue templates read unlike the rest of the codebase.
      'vue/max-attributes-per-line': 'off',
      // `withDefaults` covers the cases that matter, and optional props without a
      // default are meaningful here (an absent `root` means "no tree loaded").
      'vue/require-default-prop': 'off',
    },
    processor: pluginVue.processors['.vue'],
  },
]
