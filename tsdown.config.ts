import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/seed.ts'],
  format: ['esm'],
  sourcemap: true,
  clean: true,
});
