import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import zipPack from 'vite-plugin-zip-pack'
import manifest from './src/manifest.json'
import { version } from './package.json'

export default defineConfig(({ mode }) => ({
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
  },
  plugins: [
    react(),
    crx({ manifest: { ...manifest, version } }),
    mode === 'production' &&
      zipPack({
        inDir: 'dist',
        outDir: '.',
        outFileName: `tako-${version}.zip`,
      }),
  ].filter(Boolean),
}))
