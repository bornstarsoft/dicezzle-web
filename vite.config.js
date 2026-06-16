import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: false,
  build: {
    emptyOutDir: false,
    outDir: 'static/game/dicezzle',
    sourcemap: false,
    chunkSizeWarningLimit: 1300,
    rollupOptions: {
      input: {
        'dicezzle-game': 'src/game/main.js'
      },
      output: {
        entryFileNames: 'dicezzle-game.js',
        chunkFileNames: 'dicezzle-[name].js',
        assetFileNames: 'dicezzle-game.[ext]'
      }
    }
  },
  test: {
    environment: 'node',
    include: ['src/game/tests/**/*.test.js']
  }
});
