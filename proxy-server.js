// proxy-server.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Environment-based configuration
const isDev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || process.env.PROXY_PORT || 9000;

// Service URLs - adjust based on environment
const services = {
  development: {
    website: 'http://localhost:3000',
    backend: 'http://localhost:8001', 
    chat_service: 'http://localhost:8002',
    dashboard: 'http://localhost:8080',
    docs: 'http://localhost:3001',
  },
  production: {
    website: 'http://localhost:3002',
    backend: 'http://localhost:8001',
    chat_service: 'http://localhost:8002',
    dashboard: 'http://localhost:3004',
    docs: 'http://localhost:3003',
  }
};

const currentServices = services[isDev ? 'development' : 'production'];

// Proxy middleware options
const createProxy = (target, pathRewrite = {}) => createProxyMiddleware({
  target,
  changeOrigin: true,
  ws: true,
  pathRewrite,
  onError: (err, req, res) => {
    console.error(`❌ Proxy error for ${req.url}:`, err.message);
    if (res && res.status && !res.headersSent) {
      res.status(502).json({ 
        error: 'Service unavailable', 
        service: target,
        path: req.url 
      });
    }
  },
  onProxyReq: (proxyReq, req, res) => {
    if (req.url && !req.url.includes('webpack-hmr')) {
      console.log(`🔄 Proxying: ${req.method} ${req.url} → ${target}${req.url}`);
    }
  }
});

// API Routes - Backend
app.use('/api', createProxy(currentServices.backend, {
  '^/api': ''
}));

// Chat Service Routes
app.use('/chat', createProxy(currentServices.chat_service, {
  '^/chat': ''
}));

// Dashboard Routes AND its assets
app.use('/dashboard', createProxy(currentServices.dashboard, {
  '^/dashboard': ''
}));

// Docs Routes AND its assets - MUST come before catch-all
app.use('/docs', createProxy(currentServices.docs, {
  '^/docs': ''
}));

// Handle docs-specific Next.js assets when accessed via /docs
app.use('/_next/static', (req, res, next) => {
  // Check if this request came from /docs page
  const referer = req.get('Referer');
  if (referer && referer.includes('/docs')) {
    return createProxy(currentServices.docs)(req, res, next);
  }
  // Otherwise, let it fall through to website
  next();
});

// Handle Website Assets that docs uses
app.use('/Website%20Assets', createProxy(currentServices.docs));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    environment: isDev ? 'development' : 'production',
    services: currentServices,
    timestamp: new Date().toISOString()
  });
});

// Catch-all for main website (must be last)
app.use('/', createProxy(currentServices.website));

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 Corpus AI Proxy Server Started!');
  console.log(`📍 Environment: ${isDev ? 'Development' : 'Production'}`);
  console.log(`🌐 Proxy URL: http://0.0.0.0:${PORT}`);
  console.log('\n📋 Available Routes:');
  console.log(`  • http://localhost:${PORT}/          → Website (${currentServices.website})`);
  console.log(`  • http://localhost:${PORT}/dashboard → Dashboard (${currentServices.dashboard})`);
  console.log(`  • http://localhost:${PORT}/docs      → Documentation (${currentServices.docs})`);
  console.log(`  • http://localhost:${PORT}/api       → Backend API (${currentServices.backend})`);
  console.log(`  • http://localhost:${PORT}/chat      → Chat Service (${currentServices.chat_service})`);
  console.log(`  • http://localhost:${PORT}/health    → Health Check`);
  console.log('\n💡 Pro tip: Start your services with "pnpm dev" first!\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Proxy server shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Proxy server shutting down...');
  process.exit(0);
});