// Request pooling service for similar eBay API requests

// Active requests pool - Map of request key to promise
const activeRequestsPool = new Map();

// Configuration
const POOL_EXPIRY_MS = 10000; // How long to keep a request in the pool (10 seconds)

/**
 * Generates a pool key from price check parameters
 * @param {Object} params - Price check parameters
 * @returns {string} - Pool key
 */
function generatePoolKey(params) {
  const { itemName, model, brand, condition } = params;
  // Create a deterministic pool key from the parameters
  return `pool:${itemName}:${model || ''}:${brand || ''}:${condition || ''}`.toLowerCase();
}

/**
 * Adds a request to the pool or returns an existing one
 * @param {Object} params - Request parameters
 * @param {Function} requestFn - Function that makes the actual API request
 * @returns {Promise} - Promise that resolves with the result
 */
function pooledRequest(params, requestFn) {
  const poolKey = generatePoolKey(params);
  
  // If there's already an identical request in progress, return its promise
  if (activeRequestsPool.has(poolKey)) {
    console.log(`Request pooling: Found existing request for ${poolKey}`);
    return activeRequestsPool.get(poolKey);
  }
  
  // Otherwise, make a new request and add it to the pool
  console.log(`Request pooling: Creating new request for ${poolKey}`);
  
  const requestPromise = requestFn();
  activeRequestsPool.set(poolKey, requestPromise);
  
  // Remove the request from the pool after it completes or after expiry
  const cleanup = () => {
    setTimeout(() => {
      if (activeRequestsPool.get(poolKey) === requestPromise) {
        activeRequestsPool.delete(poolKey);
      }
    }, POOL_EXPIRY_MS);
  };
  
  // Clean up regardless of success or failure
  requestPromise.then(cleanup).catch(cleanup);
  
  return requestPromise;
}

/**
 * Get statistics about the current request pool
 * @returns {Object} - Pool statistics
 */
function getPoolStats() {
  return {
    activeRequests: activeRequestsPool.size,
    keys: Array.from(activeRequestsPool.keys())
  };
}

module.exports = {
  pooledRequest,
  getPoolStats
};
