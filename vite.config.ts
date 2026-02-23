import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import https from 'https'

// ---------------------------------------------------------------------------
// pelotonProxyPlugin
//
// Replaces the built-in Vite proxy for /api routes with a custom middleware
// that has guaranteed access to the live `sessionId` closure variable.
// This sidesteps the browser "forbidden header" restriction on Cookie:
// the browser never sets it — Node does, server-side, on every forwarded req.
// ---------------------------------------------------------------------------
function pelotonProxyPlugin(): Plugin {
  let sessionId = '';
  const PELOTON_HOST = 'api.onepeloton.com';

  return {
    name: 'peloton-proxy',
    configureServer(server) {

      // POST /__session  — store session ID in the Node closure
      // GET  /__session  — health check
      server.middlewares.use('/__session', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              sessionId = parsed.sessionId ?? '';
            } catch { /* ignore */ }
            res.writeHead(200);
            res.end(JSON.stringify({ ok: true }));
          });
        } else {
          res.writeHead(200);
          res.end(JSON.stringify({ hasSession: !!sessionId }));
        }
      });

      // Proxy every /api/* request to api.onepeloton.com, injecting the
      // Cookie header server-side where the browser restriction doesn't apply.
      server.middlewares.use('/api', (req, res) => {
        const path = req.url ?? '/';

        // Build a clean headers object — only include string/string[] values
        // and drop any hop-by-hop or proxy-added headers that Node rejects.
        const SKIP_HEADERS = new Set([
          'host', 'cookie',
          'x-forwarded-for', 'x-forwarded-host', 'x-forwarded-proto',
          'connection', 'keep-alive', 'transfer-encoding', 'upgrade',
        ]);
        const forwardHeaders: Record<string, string | string[]> = {};
        for (const [key, val] of Object.entries(req.headers)) {
          if (!SKIP_HEADERS.has(key) && val !== undefined) {
            forwardHeaders[key] = val as string | string[];
          }
        }
        forwardHeaders['host'] = PELOTON_HOST;
        forwardHeaders['origin'] = 'https://members.onepeloton.com';
        forwardHeaders['referer'] = 'https://members.onepeloton.com/';
        forwardHeaders['peloton-platform'] = 'web';
        forwardHeaders['user-agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
        forwardHeaders['accept'] = 'application/json';
        forwardHeaders['accept-language'] = 'en-US,en;q=0.9';
        if (sessionId) forwardHeaders['cookie'] = `peloton_session_id=${sessionId}`;

        console.log(`[peloton-proxy] ${req.method} /api${path} | session: ${sessionId ? sessionId.slice(0, 8) + '…' : 'NONE'} | cookie: ${forwardHeaders['cookie'] ? 'SET' : 'MISSING'}`);

        const options: https.RequestOptions = {
          hostname: PELOTON_HOST,
          port: 443,
          path: `/api${path}`,
          method: req.method ?? 'GET',
          headers: forwardHeaders,
        };

        const proxyReq = https.request(options, (proxyRes) => {
          console.log(`[peloton-proxy] ← ${proxyRes.statusCode} /api${path}`);
          res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
          proxyRes.pipe(res, { end: true });
        });

        proxyReq.on('error', (err) => {
          console.error('[peloton-proxy] upstream error:', err.message);
          if (!res.headersSent) {
            res.writeHead(502);
            res.end(JSON.stringify({ error: 'Upstream error', detail: err.message }));
          }
        });

        // Pipe request body for POST/PUT/PATCH
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          req.pipe(proxyReq, { end: true });
        } else {
          proxyReq.end();
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), pelotonProxyPlugin()],
  // No server.proxy needed — the plugin handles /api and /__session
})
