const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy OAuth API calls to the OAuth server
  app.use(
    '/api/auth',
    createProxyMiddleware({
      target: 'http://localhost:5001',
      changeOrigin: true,
      logLevel: 'debug'
    })
  );
};
