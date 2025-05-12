// Rate limiting service for eBay API requests

// Token bucket algorithm for rate limiting
const REFILL_RATE = 5; // Tokens per second (max 5 req/sec for non-premium users)
const MAX_TOKENS = 10; // Maximum tokens in the bucket
const DAILY_LIMIT = 5000; // Daily API call limit per app

// Current state
let availableTokens = MAX_TOKENS;
let lastRefillTimestamp = Date.now();
let dailyApiCalls = 0; // Count of API calls today
let lastDayReset = new Date().setHours(0, 0, 0, 0);

// Request queue for when we exceed rate limits
const requestQueue = [];

/**
 * Refills tokens based on time elapsed since last refill
 */
function refillTokens() {
  const now = Date.now();
  const timePassed = now - lastRefillTimestamp;
  const newTokens = Math.floor(timePassed * REFILL_RATE / 1000);
  
  if (newTokens > 0) {
    availableTokens = Math.min(availableTokens + newTokens, MAX_TOKENS);
    lastRefillTimestamp = now;
  }
  
  // Check if we need to reset the daily counter
  const today = new Date().setHours(0, 0, 0, 0);
  if (today > lastDayReset) {
    console.log('Resetting daily API call count');
    dailyApiCalls = 0;
    lastDayReset = today;
  }
}

/**
 * Processes the next request in the queue if tokens are available
 */
function processQueue() {
  if (requestQueue.length === 0 || availableTokens < 1) return;
  
  // Sort the queue by priority before processing
  requestQueue.sort((a, b) => b.priority - a.priority);
  
  const { requestFn, resolve, reject } = requestQueue.shift();
  
  // Execute the actual request
  availableTokens -= 1;
  dailyApiCalls += 1;
  
  requestFn()
    .then(resolve)
    .catch(reject)
    .finally(() => {
      // After request completes, see if we can process more from the queue
      setTimeout(processQueue, 0);
    });
}

/**
 * Rate limits a request using the token bucket algorithm
 * @param {Function} requestFn - Function to execute that makes the actual API request
 * @param {Object} options - Options including isPremium flag and priority
 * @returns {Promise} - Promise that resolves with the API result
 */
function limitRequest(requestFn, options = {}) {
  return new Promise((resolve, reject) => {
    const { isPremium = false, priority = 1 } = options;
    
    // Refill tokens based on time elapsed
    refillTokens();
    
    // Check if we've hit the daily limit
    if (dailyApiCalls >= DAILY_LIMIT && !isPremium) {
      reject(new Error('Daily API call limit reached. Try again tomorrow or upgrade to premium.'));
      return;
    }
    
    // Premium users get higher effective priority
    const effectivePriority = isPremium ? priority + 10 : priority;
    
    // If tokens are available and queue is empty, execute immediately
    if (availableTokens >= 1 && requestQueue.length === 0) {
      availableTokens -= 1;
      dailyApiCalls += 1;
      
      requestFn()
        .then(resolve)
        .catch(reject);
    } else {
      // Otherwise, add to the queue
      console.log(`Rate limit reached, adding request to queue (priority: ${effectivePriority})`);
      requestQueue.push({ requestFn, resolve, reject, priority: effectivePriority });
      
      // If this is premium user and they get queued, process more aggressively
      if (isPremium) {
        refillTokens(); // Try to refill tokens again
        processQueue(); // Try to process queue
      }
    }
  });
}

// Start the queue processor
setInterval(() => {
  refillTokens();
  processQueue();
}, 200); // Check every 200ms

/**
 * Get statistics about the rate limiter
 * @returns {Object} - Rate limiter statistics
 */
function getLimiterStats() {
  return {
    availableTokens,
    dailyApiCalls,
    queueLength: requestQueue.length,
    dailyLimitRemaining: DAILY_LIMIT - dailyApiCalls
  };
}

module.exports = {
  limitRequest,
  getLimiterStats
};
