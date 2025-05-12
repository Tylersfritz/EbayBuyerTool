
// Cache service for eBay API price check results
const NodeCache = require('node-cache');

// Create a cache with a default TTL of 30 minutes (1800 seconds)
const priceCheckCache = new NodeCache({ 
  stdTTL: 1800, 
  checkperiod: 300, // Check for expired keys every 5 minutes
  useClones: false  // Store references to optimize memory usage
});

/**
 * Generates a cache key from price check parameters
 * @param {Object} params - Price check parameters
 * @returns {string} - Cache key
 */
function generateCacheKey(params) {
  const { itemName, model, brand, condition } = params;
  // Create a deterministic cache key from the parameters
  return `price_check:${itemName}:${model || ''}:${brand || ''}:${condition || ''}`.toLowerCase();
}

/**
 * Attempts to get a cached price check result
 * @param {Object} params - Price check parameters
 * @returns {Object|null} - Cached result or null if not found/expired
 */
function getCachedPriceCheck(params) {
  const cacheKey = generateCacheKey(params);
  const cachedResult = priceCheckCache.get(cacheKey);
  
  if (cachedResult) {
    console.log(`Cache hit for key: ${cacheKey}`);
    return cachedResult;
  }
  
  console.log(`Cache miss for key: ${cacheKey}`);
  return null;
}

/**
 * Stores a price check result in the cache
 * @param {Object} params - Price check parameters
 * @param {Object} result - Price check result
 * @param {number} ttl - Optional TTL in seconds (defaults to cache default)
 */
function cachePriceCheckResult(params, result, ttl = undefined) {
  const cacheKey = generateCacheKey(params);
  priceCheckCache.set(cacheKey, result, ttl);
  console.log(`Cached result for key: ${cacheKey}`);
}

/**
 * Gets cache statistics
 * @returns {Object} - Cache stats
 */
function getCacheStats() {
  return {
    keys: priceCheckCache.keys().length,
    hits: priceCheckCache.getStats().hits,
    misses: priceCheckCache.getStats().misses,
    ksize: priceCheckCache.getStats().ksize,
    vsize: priceCheckCache.getStats().vsize,
  };
}

/**
 * Clears the cache
 */
function clearCache() {
  priceCheckCache.flushAll();
  console.log('Price check cache cleared');
}

module.exports = {
  getCachedPriceCheck,
  cachePriceCheckResult,
  getCacheStats,
  clearCache
};
