import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'url'
import { defineConfig } from 'vite'
import nodePolyfills from 'vite-plugin-node-stdlib-browser'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    nodePolyfills()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  base: '/jackal-editor/'

})