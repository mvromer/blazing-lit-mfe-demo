import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: {
        lifecycles: 'src/lifecycles.ts',
      },
      formats: ['es'],
    },

    rollupOptions: {
      external: [/^lit/, /^single-spa/],
    },
  },
});
