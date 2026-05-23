const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = 3000;

// Proxy all /api requests to the backend service
app.use('/api', createProxyMiddleware({
  target: process.env.BACKEND_URL || 'http://backend:5000',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api'
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Backend service unavailable' });
  }
}));

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build')));

// For all other routes, serve index.html (React Router support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Frontend server running on port ${PORT}`);
  console.log(`📡 API proxy configured to: ${process.env.BACKEND_URL || 'http://backend:5000'}`);
});
