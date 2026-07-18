import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/seed.ts'],
  format: ['esm'],
  exports: true,
  sourcemap: true,
  clean: true,
});
