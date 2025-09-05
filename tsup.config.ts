import { defineConfig } from 'tsup'

export default defineConfig({
  format: ['iife'],
  sourcemap: true,
  minify: true,
  outDir: 'dist',
  // Ensure all comments including license banners are removed
  esbuildOptions(options) {
    options.legalComments = 'none'
  },
})
