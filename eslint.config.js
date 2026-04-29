import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import boundaries from 'eslint-plugin-boundaries'
import { defineConfig, globalIgnores } from 'eslint/config'

// FSD layer order (low → high): shared → entities → features → widgets → pages → app
const FSD_LAYERS = ['shared', 'entities', 'features', 'widgets', 'pages', 'app']

export default defineConfig([
  globalIgnores(['dist', 'server']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: { boundaries },
    settings: {
      'boundaries/elements': FSD_LAYERS.map((layer) => ({
        type: layer,
        pattern: `src/${layer}/*`,
      })),
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            { from: 'shared',   allow: [] },
            { from: 'entities', allow: ['shared'] },
            { from: 'features', allow: ['shared', 'entities'] },
            { from: 'widgets',  allow: ['shared', 'entities', 'features'] },
            { from: 'pages',    allow: ['shared', 'entities', 'features', 'widgets'] },
            { from: 'app',      allow: ['shared', 'entities', 'features', 'widgets', 'pages'] },
          ],
        },
      ],
      // Allow unused vars/args prefixed with _ (intentionally unused)
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      // React Compiler rules — too aggressive for valid patterns in this codebase
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/incompatible-library': 'off',
    },
  },
  // TanStack Router: route files must export Route (non-component) — expected pattern
  {
    files: ['src/routes/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  // shadcn/ui: shared UI components export variants alongside components — expected pattern
  {
    files: ['src/shared/ui/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
