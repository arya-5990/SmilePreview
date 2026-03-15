import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy Groq API calls to avoid CORS
      '/groq': {
        target: 'https://api.groq.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/groq/, ''),
        secure: true,
      },
      // Proxy Gemini API calls to avoid CORS (for image editing)
      '/gemini': {
        target: 'https://generativelanguage.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gemini/, ''),
        secure: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // Forward the x-goog-api-key header to Google
            if (req.headers['x-goog-api-key']) {
              proxyReq.setHeader('x-goog-api-key', req.headers['x-goog-api-key']);
            }
          });
        },
      },
    },
  },
})
