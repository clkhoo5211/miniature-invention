// ESLint flat config for Next.js with ESLint v9
// Reference: https://nextjs.org/docs/app/api-reference/config/eslint
import { defineConfig } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

export default defineConfig([
  // Next.js recommended rules focused on Core Web Vitals
  ...nextVitals,
  // Global rule tweaks
  {
    rules: {
      // Many content pages use typographic quotes; reduce noise by warning instead of error
      'react/no-unescaped-entities': 'warn',
    },
  },
  // TypeScript-specific lint rules
  ...nextTypescript,
  // Project-specific ignores
  {
    ignores: [
      '**/node_modules/**',
      '.next/**',
      'dist/**',
      'out/**',
      'build/**',
      '**/*.min.js',
    ],
  },
  // Relax rules for tests and config files
  {
    files: ['tests/**/*.{ts,tsx,js}', '**/*.test.{ts,tsx,js}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
  {
    files: ['tailwind.config.js'],
    rules: {
      'import/no-anonymous-default-export': 'off',
    },
  },
  {
    files: ['postcss.config.js'],
    rules: {
      'import/no-anonymous-default-export': 'off',
    },
  },
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]);