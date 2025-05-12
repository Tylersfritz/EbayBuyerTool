
// API stats endpoint to check cache, request pool and rate limiter status
const cacheService = require('./cache-service');
const poolingService = require('./request-pooling');
const rateLimiter = require('./rate-limiter');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
    });
  }

  // Get stats from all services
  const stats = {
    cache: cacheService.getCacheStats(),
    pooling: poolingService.getPoolStats(),
    rateLimiter: rateLimiter.getLimiterStats(),
    timestamp: new Date().toISOString()
  };

  // Optionally clear cache if requested
  if (req.query.clearCache === 'true') {
    cacheService.clearCache();
    stats.cacheCleared = true;
  }

  return res.status(200).json(stats);
};
