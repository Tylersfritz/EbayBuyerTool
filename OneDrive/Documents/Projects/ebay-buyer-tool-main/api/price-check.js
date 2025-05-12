```javascript
// api/price-check.js
const fetch = require('node-fetch');
const cacheService = require('./cache-service');
const poolingService = require('./request-pooling');
const rateLimiter = require('./rate-limiter');

let cachedToken = null;

async function getEbayOAuthToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 300000) {
    console.log('Using cached eBay OAuth token');
    return cachedToken.token;
  }

  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Missing eBay credentials: EBAY_CLIENT_ID or EBAY_CLIENT_SECRET not set');
    throw new Error('Server configuration error: Missing eBay API credentials');
  }

  try {
    console.log('Fetching new eBay OAuth token');
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const response = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
      },
      body: 'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Token fetch failed: Status=${response.status}, Response=${errorText}`);
      throw new Error(`Failed to fetch eBay token: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const token = data.access_token;
    const expiresAt = Date.now() + data.expires_in * 1000;

    cachedToken = { token, expiresAt };
    console.log('New eBay OAuth token cached');
    return token;
  } catch (error) {
    console.error('Token fetch error:', error);
    throw error;
  }
}

/**
 * Maps common condition values to eBay Buy API condition IDs
 * @param {string} condition - The condition to map
 * @returns {string} - eBay condition ID or condition group
 */
function mapConditionToEbayFormat(condition) {
  if (!condition) return '';

  const conditionMap = {
    'NEW': 'NEW',
    'USED': 'USED',
    'USED_EXCELLENT': 'USED_EXCELLENT',
    'USED_VERY_GOOD': 'USED_VERY_GOOD',
    'USED_GOOD': 'USED_GOOD',
    'USED_ACCEPTABLE': 'USED_ACCEPTABLE',
    'REFURBISHED': 'REFURBISHED',
    'SELLER_REFURBISHED': 'SELLER_REFURBISHED',
    'CERTIFIED_REFURBISHED': 'CERTIFIED_REFURBISHED',
    'MANUFACTURER_REFURBISHED': 'MANUFACTURER_REFURBISHED',
    'FOR_PARTS': 'FOR_PARTS_OR_NOT_WORKING',
    'FOR_PARTS_OR_NOT_WORKING': 'FOR_PARTS_OR_NOT_WORKING',
    'DAMAGED': 'FOR_PARTS_OR_NOT_WORKING'
  };

  const upperCondition = condition.toUpperCase();
  return conditionMap[upperCondition] || upperCondition;
}

/**
 * Builds the proper eBay Buy API condition filter string
 * @param {string} condition - The mapped condition value
 * @returns {string} - Formatted condition filter string
 */
function buildConditionFilter(condition) {
  if (!condition) return '';

  if (condition === 'USED') {
    return 'conditionIds:{2000|2010|2020|2030|2500}';
  }

  return `conditions:{${condition}}`;
}

/**
 * Makes the eBay API call with enhanced context
 * @param {Object} params - API call parameters
 * @returns {Promise} - Promise that resolves with API result
 */
async function makeEbayApiCall(params) {
  const { itemName, model, brand, condition } = params;
  const accessToken = await getEbayOAuthToken();

  let url = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(itemName)}&category_ids=9355&limit=50`;

  if (model) url += `&filter=model:${encodeURIComponent(model)}`;
  if (brand) url += `&filter=brand:${encodeURIComponent(brand)}`;

  if (condition) {
    const ebayCondition = mapConditionToEbayFormat(condition);
    const conditionFilter = buildConditionFilter(ebayCondition);
    url += `&filter=${conditionFilter}`;
    console.log(`Using condition filter: ${conditionFilter}`);
  }

  console.log(`Calling eBay Buy API with URL: ${url}`);

  const ebayResponse = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-EBAY-API-SITEID': '0',
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
  });

  if (!ebayResponse.ok) {
    const errorText = await ebayResponse.text();
    console.error(`eBay API error: Status=${ebayResponse.status}, Response=${errorText}`);
    if (ebayResponse.status === 401) {
      throw new Error(`Unauthorized: Invalid or expired eBay API token - ${errorText}`);
    }
    throw new Error(`eBay API error: ${ebayResponse.status} - ${errorText}`);
  }

  const ebayData = await ebayResponse.json();
  if (ebayData.warnings) {
    console.warn('eBay API warnings:', ebayData.warnings);
  }

  const items = ebayData.itemSummaries || [];

  if (items.length > 0) {
    console.log(`Found ${items.length} items. Sample conditions:`);
    items.slice(0, 5).forEach((item, i) => {
      console.log(`Item ${i+1}: ${item.condition || 'No condition'} - ${item.price?.value || 'No price'}`);
    });
  } else {
    console.log('No items found with the current filter criteria');
  }

  const prices = items
    .map(item => parseFloat(item.price?.value) || 0)
    .filter(price => price > 0);

  return {
    averagePrice: prices.length > 0 ? prices.reduce((sum, p) => sum + p, 0) / prices.length : 0,
    priceHistory: items.map(item => ({
      date: item.lastSoldDate || new Date().toISOString(),
      price: parseFloat(item.price?.value) || 0
    })),
    sampleSize: prices.length,
    dateRange: prices.length > 0
      ? `${new Date(items[items.length - 1].lastSoldDate || new Date()).toLocaleDateString()} - ${new Date().toISOString().split('T')[0]}`
      : null,
    source: 'eBay Browse API',
    itemCount: items.length,
    timestamp: new Date().toISOString()
  };
}

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
    console.error('Price check error:', error);
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
```