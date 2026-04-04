// proxy-server.js - Unified entry point for all Corpus AI services
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

app.use(cors());

const isDev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || process.env.PROXY_PORT || 3000;

// Service URLs
const services = {
  development: {
    website: 'http://localhost:3002',
    backend: 'http://localhost:8001',
    dashboard: 'http://localhost:8080',
    docs: 'http://localhost:3001',
  },
  production: {
    website: 'http://localhost:3002',
    backend: 'http://localhost:8001',
    dashboard: 'http://localhost:3004',
    docs: 'http://localhost:3003',
  }
};

const currentServices = services[isDev ? 'development' : 'production'];

// Track which services are ready (have responded successfully at least once)
const serviceReady = {};

const createProxy = (target, pathRewrite = {}) => createProxyMiddleware({
  target,
  changeOrigin: true,
  ws: true,
  pathRewrite,
  onError: (err, req, res) => {
    if (err.code === 'ECONNREFUSED' && !serviceReady[target]) {
      // Service not ready yet during startup - show a friendly waiting page
      if (res && !res.headersSent) {
        res.writeHead(503, { 'Content-Type': 'text/html', 'Retry-After': '3' });
        res.end(`
          <html><head>
            <title>Starting up...</title>
            <meta http-equiv="refresh" content="3">
            <style>body{font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f8f9fa;color:#333}
            .box{text-align:center;padding:2rem}.spinner{width:40px;height:40px;border:4px solid #e0e0e0;border-top:4px solid #BF56FF;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 1rem}
            @keyframes spin{to{transform:rotate(360deg)}}</style>
          </head><body><div class="box"><div class="spinner"></div><h2>Starting up...</h2><p>Waiting for service at ${target}</p><p style="color:#888;font-size:0.9rem">This page will auto-refresh in 3 seconds</p></div></body></html>
        `);
      }
    } else {
      console.error(`Proxy error for ${req.url}:`, err.message);
      if (res && res.status && !res.headersSent) {
        res.status(502).json({
          error: 'Service unavailable',
          service: target,
          path: req.url
        });
      }
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    if (!serviceReady[target]) {
      serviceReady[target] = true;
    }
  },
  onProxyReq: (proxyReq, req, res) => {
    if (req.url && !req.url.includes('webpack-hmr') && !req.url.includes('_next')) {
      console.log(`-> ${req.method} ${req.url} => ${target}`);
    }
  }
});

// API Routes -> Backend
app.use('/api', createProxy(currentServices.backend));

// Dashboard Routes -> Dashboard app (basePath: /dashboard handles asset namespacing)
app.use('/dashboard', createProxy(currentServices.dashboard));

// Docs Routes -> Docs app (basePath: /docs handles asset namespacing)
app.use('/docs', createProxy(currentServices.docs));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: isDev ? 'development' : 'production',
    services: currentServices,
    timestamp: new Date().toISOString()
  });
});

// Catch-all -> Website (must be last)
app.use('/', createProxy(currentServices.website));

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n  Corpus AI Proxy Server');
  console.log(`  ${isDev ? 'Development' : 'Production'} mode on http://localhost:${PORT}\n`);
  console.log(`  /              -> Website   (${currentServices.website})`);
  console.log(`  /dashboard     -> Dashboard (${currentServices.dashboard})`);
  console.log(`  /docs          -> Docs      (${currentServices.docs})`);
  console.log(`  /api           -> Backend   (${currentServices.backend})`);
  console.log(`  /health        -> Health Check\n`);
});

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
