// tsup.config.js
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.js'],
  format: ['esm', 'cjs'],
  dts: true,
  outExtension({ format }) {
    return { js: format === 'esm' ? '.esm.js' : '.cjs.js' }
  },
})
