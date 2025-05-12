// api/price-check.js
const fetch = require('node-fetch');
const cacheService = require('./cache-service');
const poolingService = require('./request-pooling');
const rateLimiter = require('./rate-limiter');

let cachedToken = null;

async function getEbayOAuthToken() {
  try {
    if (cachedToken && cachedToken.expiresAt > Date.now() + 300000) {
      console.log('Using cached eBay OAuth token');
      return cachedToken.token;
    }

    const clientId = process.env.EBAY_CLIENT_ID;
    const clientSecret = process.env.EBAY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('Missing eBay credentials');
      throw new Error('Missing eBay API credentials');
    }

    console.log('Fetching new eBay OAuth token');
    // Use string concatenation instead of template literal
    const credentials = Buffer.from(clientId + ':' + clientSecret).toString('base64');
    const response = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + credentials,
      },
      body: 'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Token fetch failed: Status=${response.status}, Response=${errorText}`);
      throw new Error(`Failed to fetch eBay token: ${response.status}`);
    }

    const data = await response.json();
    const token = data.access_token;
    const expiresAt = Date.now() + data.expires_in * 1000;

    cachedToken = { token, expiresAt };
    console.log('New eBay OAuth token cached');
    return token;
  } catch (error) {
    console.error('Token fetch error:', error.message);
    throw error;
  }
}

// ... (rest of the file unchanged, ensure no other template literals use `$`)

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      averagePrice: 0,
      itemCount: 0,
      sampleSize: 0,
      dateRange: null,
      source: 'eBay Browse API',
      timestamp: new Date().toISOString(),
      error: 'Method not allowed'
    });
  }

  const { itemName, model, brand, condition, premium } = req.query;
  const isPremium = premium === 'true';

  if (!itemName) {
    return res.status(400).json({
      averagePrice: 0,
      itemCount: 0,
      sampleSize: 0,
      dateRange: null,
      source: 'eBay Browse API',
      timestamp: new Date().toISOString(),
      error: 'itemName is required'
    });
  }

  const params = { itemName, model, brand, condition };

  try {
    const cachedResult = cacheService.getCachedPriceCheck(params);
    if (cachedResult) {
      console.log('Returning cached price check result');
      return res.status(200).json(cachedResult);
    }

    const result = await poolingService.pooledRequest(params, () => {
      return rateLimiter.limitRequest(
        () => makeEbayApiCall(params),
        { isPremium, priority: isPremium ? 2 : 1 }
      );
    });

    cacheService.cachePriceCheckResult(params, result);
    console.log('Price check response:', result);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Price check error:', error.message);
    const errorMessage = error.message || 'Failed to fetch price data';
    const statusCode = error.message.includes('Unauthorized') ? 401 :
                      error.message.includes('Daily API call limit') ? 429 : 500;

    return res.status(statusCode).json({
      averagePrice: 0,
      itemCount: 0,
      sampleSize: 0,
      dateRange: null,
      source: 'eBay Browse API',
      timestamp: new Date().toISOString(),
      error: errorMessage
    });
  }
};