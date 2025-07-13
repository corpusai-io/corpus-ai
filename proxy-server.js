// proxy-server.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Environment-based configuration
const isDev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PROXY_PORT || 9000; // Changed from 8080 to avoid conflict

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
    website: process.env.WEBSITE_URL || 'http://website:3000',
    backend: process.env.BACKEND_URL || 'http://backend:8001',
    chat_service: process.env.CHAT_SERVICE_URL || 'http://chat_service:8002',
    dashboard: process.env.DASHBOARD_URL || 'http://dashboard:8080',
    docs: process.env.DOCS_URL || 'http://docs:3001',
  }
};

const currentServices = services[isDev ? 'development' : 'production'];

// Proxy middleware options
const createProxy = (target, pathRewrite = {}) => createProxyMiddleware({
  target,
  changeOrigin: true,
  ws: true, // Enable WebSocket proxying
  pathRewrite,
  onError: (err, req, res) => {
    console.error(`❌ Proxy error for ${req.url}:`, err.message);
    res.status(502).json({ 
      error: 'Service unavailable', 
      service: target,
      path: req.url 
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔄 Proxying: ${req.method} ${req.url} → ${target}${req.url}`);
  }
});

// API Routes - Backend
app.use('/api', createProxy(currentServices.backend, {
  '^/api': '' // Remove /api prefix when forwarding to backend
}));

// Chat Service Routes
app.use('/chat', createProxy(currentServices.chat_service, {
  '^/chat': '' // Remove /chat prefix when forwarding to chat service
}));

// Dashboard Routes
app.use('/dashboard', createProxy(currentServices.dashboard, {
  '^/dashboard': '' // Remove /dashboard prefix when forwarding to dashboard
}));

// Documentation Routes
app.use('/docs', createProxy(currentServices.docs, {
  '^/docs': '' // Remove /docs prefix when forwarding to docs
}));

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
app.listen(PORT, () => {
  console.log('\n🚀 Corpus AI Proxy Server Started!');
  console.log(`📍 Environment: ${isDev ? 'Development' : 'Production'}`);
  console.log(`🌐 Proxy URL: http://localhost:${PORT}`);
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