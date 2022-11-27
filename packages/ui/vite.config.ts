import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: 'src/keygate-ui.ts',
      formats: ['es']
    },
    rollupOptions: {
      external: /^lit/
    }
  }
}) 