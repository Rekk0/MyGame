import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    build: {
      lib: {
        entry: resolve(__dirname, 'electron/main.ts')
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'electron/preload/index.ts')
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    root: 'src',
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'src/index.html'),
          hud: resolve(__dirname, 'src/hud.html'),
          quickInput: resolve(__dirname, 'src/quickInput.html'),
          achievement: resolve(__dirname, 'src/achievement.html')
        }
      }
    },
    resolve: {
      alias: {
        '@renderer': resolve('src')
      }
    },
    plugins: [react(), tailwindcss()]
  }
})
