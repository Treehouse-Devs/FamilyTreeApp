import { fileURLToPath, URL } from 'node:url'
import * as path from 'node:path'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))
const monorepoRoot = path.resolve(projectRoot, '../..')

export default defineConfig({
  plugins: [vue(), tailwindcss()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },

    // Yarn hoisting leaves a second, identical copy of pinia in this workspace's
    // node_modules while pinia-plugin-persistedstate resolves the root one. Two
    // registries would mean two sets of stores — and the plugin would register
    // against the copy the app never reads. Force a single instance.
    dedupe: ['vue', 'vue-router', 'pinia'],
  },

  server: {
    // `@treely/dto` is a workspace package served straight from source, so Vite
    // needs permission to read outside this app's root.
    fs: {
      allow: [monorepoRoot],
    },
  },

  // The DTO package ships raw TypeScript rather than a build artifact, so it has
  // to go through Vite's transform pipeline instead of being pre-bundled.
  optimizeDeps: {
    exclude: ['@treely/dto'],
  },

  test: {
    environment: 'happy-dom',
    include: ['src/**/*.spec.ts'],
  },
})
