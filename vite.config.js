import path from "path"
import { fileURLToPath } from 'url'
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
 
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: true,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          // Increase timeout to 2 minutes for file uploads
          proxy.on('proxyReq', function(proxyReq, _req, _res) {
            proxyReq.setTimeout(120000); // 2 minutes
          });
          // Handle proxy errors
          proxy.on('error', function(err, req, res) {
            console.error('Proxy error:', err);
            res.writeHead(500, {
              'Content-Type': 'application/json'
            });
            res.end(JSON.stringify({
              success: false,
              message: 'Proxy error. The server may be unavailable.'
            }));
          });
        }
      }
    }
  }
})
