const NodeCache = require('node-cache');

// Initialize cache with a default TTL of 1 hour (3600 seconds)
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

// Generate a unique cache key based on parameters
function generateCacheKey(params) {
  return `price-check:${JSON.stringify(params)}`;
}

module.exports = {
  // Get cached price check result
  getCachedPriceCheck(params) {
    const key = generateCacheKey(params);
    const cachedData = cache.get(key);
    if (cachedData) {
      console.log(`Cache hit for key: ${key}`);
      return cachedData;
    }
    console.log(`Cache miss for key: ${key}`);
    return null;
  },

  // Cache price check result with a specific TTL (default to 1 hour)
  cachePriceCheckResult(params, result, ttl = 3600) {
    const key = generateCacheKey(params);
    cache.set(key, result, ttl);
    console.log(`Cached result for key: ${key}, TTL: ${ttl} seconds`);
  },

  // Generic get method for other caching needs (e.g., tokens)
  get(key) {
    const data = cache.get(key);
    if (data) {
      console.log(`Cache hit for key: ${key}`);
      return data;
    }
    console.log(`Cache miss for key: ${key}`);
    return null;
  },

  // Generic set method for other caching needs
  set(key, value, ttl = 3600) {
    cache.set(key, value, ttl);
    console.log(`Cached data for key: ${key}, TTL: ${ttl} seconds`);
  }
};