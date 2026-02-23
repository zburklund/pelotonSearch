import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'http'

// Holds the session ID in the Node process so the proxy can inject it.
// Updated via the /__session endpoint called from the React app.
let pelotonSessionId = '';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Special endpoint: the React app POSTs the session ID here so the
      // Node proxy process can store and forward it as a Cookie header.
      '/__session': {
        target: 'http://localhost:5173',
        bypass(req: IncomingMessage, res: ServerResponse | undefined) {
          if (!res) return undefined;
          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
            req.on('end', () => {
              try {
                const { sessionId } = JSON.parse(body);
                pelotonSessionId = sessionId ?? '';
              } catch { /* ignore parse errors */ }
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ ok: true }));
            });
            return null; // handled — don't forward to proxy target
          }
          // GET: return current status
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ hasSession: !!pelotonSessionId }));
          return null;
        },
      },

      // All Peloton API calls: strip the custom header and inject the
      // real Cookie so the browser never touches the forbidden header.
      '/api': {
        target: 'https://api.onepeloton.com',
        changeOrigin: true,
        secure: true,
        configure(proxy) {
          proxy.on('proxyReq', (proxyReq) => {
            // Remove the forwarding header (sent by the React app)
            proxyReq.removeHeader('x-peloton-session-id');
            // Inject the real cookie if we have a session
            if (pelotonSessionId) {
              proxyReq.setHeader('Cookie', `peloton_session_id=${pelotonSessionId}`);
            }
          });
        },
      },
    },
  },
})
