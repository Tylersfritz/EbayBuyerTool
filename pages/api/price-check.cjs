const cacheService = require('./cache-service.cjs');
const fetch = require('node-fetch');

/**
 * Fetches an OAuth token from eBay, with caching
 */
async function getEbayOAuthToken(clientId, clientSecret) {
  try {
    const cachedTokenData = cacheService.get('ebay_oauth_token');
    const now = Date.now();

    if (cachedTokenData && cachedTokenData.expiresAt > now) {
      console.log('Using cached eBay OAuth token');
      return cachedTokenData.accessToken;
    }

    console.log('Attempting to fetch eBay OAuth token');
    console.log('Client ID (partial):', clientId.slice(0, 10) + '...');
    const authHeader = 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64');
    console.log('Authorization header (partial):', authHeader.slice(0, 10) + '...');
    const response = await fetch('https://api.sandbox.ebay.com/identity/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: authHeader
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        scope: 'https://api.ebay.com/oauth/api_scope/buy.marketplace.insights'
      })
    });
    const data = await response.json();
    console.log('eBay OAuth Token Response:', data);
    if (!response.ok) {
      console.error('eBay OAuth Error:', {
        status: response.status,
        statusText: response.statusText,
        error: data.error,
        error_description: data.error_description
      });
      throw new Error(`Failed to fetch eBay token: ${response.status}`);
    }

    const expiresIn = data.expires_in || 7200;
    const expiresAt = now + (expiresIn * 1000);
    cacheService.set('ebay_oauth_token', {
      accessToken: data.access_token,
      expiresAt: expiresAt
    }, expiresIn);

    return data.access_token;
  } catch (error) {
    console.error('getEbayOAuthToken Error:', error.message);
    throw error;
  }
}

/**
 * Maps condition values to eBay condition IDs
 */
function mapConditionToEbayFormat(condition) {
  const conditionMap = {
    NEW: '1000',
    USED: '2000|2010|2020|2030|2500',
    REFURBISHED: '3000',
    USED_EXCELLENT: '2010',
    USED_VERY_GOOD: '2020',
    USED_GOOD: '2030',
    USED_ACCEPTABLE: '2500',
    CERTIFIED_REFURBISHED: '3000',
    MANUFACTURER_REFURBISHED: '3000',
    SELLER_REFURBISHED: '3000',
    FOR_PARTS_OR_NOT_WORKING: '7000'
  };
  return conditionMap[condition.toUpperCase()] || '1000';
}

/**
 * Builds a condition filter for the eBay API
 */
function buildConditionFilter(ebayCondition) {
  return `conditionIds:{${ebayCondition}}`;
}

/**
 * Determines the item category and minimum price threshold
 */
function getItemCategory(itemName, itemSpecifics) {
  const lowValueKeywords = [
    'case', 'cover', 'charger', 'cable', 'earbuds', 'headphones', 'earphones',
    'card', 'collectible', 'sticker', 'accessory', 'adapter', 'screen protector',
    'mount', 'holder', 'strap', 'band', 'keychain', 'patch', 'figurine', 'pin',
    'decal', 'wallet', 'pouch', 'sleeve', 'lens cap', 'cleaning kit'
  ];
  const highValueKeywords = [
    'pro', 'max', 'ultra', 'plus', 'smartphone', 'laptop', 'tablet', 'console',
    'camera', 'drone', 'watch', 'desktop', 'monitor', 'graphics card', 'ssd',
    'processor', 'memory', 'tv', 'projector', 'amplifier', 'speaker system'
  ];
  const normalizedItemName = itemName.toLowerCase();
  const specs = itemSpecifics || {};

  const lowValueCategories = [
    'Cell Phone Accessories', 'Collectibles', 'Trading Card Games',
    'Jewelry & Watches', 'Health & Beauty', 'Crafts', 'Home & Garden',
    'Toys & Hobbies'
  ];
  const highValueCategories = [
    'Cell Phones & Smartphones', 'Computers/Tablets & Networking',
    'Consumer Electronics', 'Cameras & Photo', 'Video Games & Consoles',
    'Musical Instruments & Gear'
  ];

  const category = specs.Category || specs.Type || '';
  const isLowValueCategory = lowValueCategories.some(cat => category.toLowerCase().includes(cat.toLowerCase()));
  const isHighValueCategory = highValueCategories.some(cat => category.toLowerCase().includes(cat.toLowerCase()));

  if (isLowValueCategory || lowValueKeywords.some(keyword => normalizedItemName.includes(keyword))) {
    return { category: 'low-value', minPrice: 0, minItems: 1 };
  } else if (isHighValueCategory || highValueKeywords.some(keyword => normalizedItemName.includes(keyword))) {
    return { category: 'high-value', minPrice: 50, minItems: 3 };
  } else {
    return { category: 'mid-value', minPrice: 10, minItems: 2 };
  }
}

/**
 * Filters outlier prices using IQR method
 */
function calculatePriceOutliers(prices) {
  if (prices.length < 3) return prices;
  const sorted = [...prices].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length / 4)];
  const q3 = sorted[Math.floor(3 * sorted.length / 4)];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  return prices.filter(price => price >= lowerBound);
}

/**
 * Makes an API call to the eBay Marketplace Insights API, with caching
 */
async function makeEbayApiCall(params, accessToken, condition) {
  try {
    const query = encodeURIComponent(params.itemName);
    let url = `https://api.sandbox.ebay.com/buy/marketplace_insights/v1_beta/item_sales/search?q=${query}&fieldgroups=ITEM_SALES&limit=10`;
    if (condition) {
      const ebayCondition = mapConditionToEbayFormat(condition);
      const conditionFilter = buildConditionFilter(ebayCondition);
      url += `&filter=${conditionFilter}`;
      console.log(`Using condition filter: ${conditionFilter}`);
    }
    
    // Generate a cache key for the API response
    const cacheKey = `ebay_api:${url}`;
    const cachedData = cacheService.get(cacheKey);
    if (cachedData) {
      console.log('Returning cached eBay API response');
      return cachedData;
    }

    console.log('eBay API Request URL:', url);
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
      }
    });
    const data = await response.json();
    console.log('eBay API Response:', data);
    if (!response.ok) {
      console.error('eBay API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: data.error,
        error_description: data.error_description
      });
      throw new Error(`Failed to fetch eBay data: ${response.status}`);
    }

    // Cache the API response for 1 hour (3600 seconds)
    const items = data.itemSummaries || [];
    cacheService.set(cacheKey, items, 3600);
    return items;
  } catch (error) {
    console.error('makeEbayApiCall Error:', error.message);
    throw error;
  }
}

/**
 * Main handler for price check API
 */
module.exports = async function (req, res) {
  const params = req.query;
  console.log('Received params:', params);

  // Check cache for price check result
  const cachedResult = cacheService.getCachedPriceCheck(params);
  if (cachedResult) {
    console.log('Returning cached price check result');
    return res.status(200).json(cachedResult);
  }

  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Missing eBay API credentials');
    return res.status(500).json({ error: 'Missing eBay API credentials' });
  }

  try {
    const accessToken = await getEbayOAuthToken(clientId, clientSecret);

    const { category, minPrice, minItems } = getItemCategory(params.itemName || '', params.itemSpecifics || {});
    console.log(`Item category: ${category}, minPrice: ${minPrice}, minItems: ${minItems}`);

    const conditions = ['NEW', 'USED', 'REFURBISHED'];
    const conditionAnalysis = [];

    for (const cond of conditions) {
      const items = await makeEbayApiCall(params, accessToken, cond);
      const prices = items
        .filter(item => item.price && item.price.value)
        .map(item => parseFloat(item.price.value));
      const filteredPrices = calculatePriceOutliers(prices.filter(price => price >= minPrice));
      if (filteredPrices.length >= minItems) {
        const averagePrice = (filteredPrices.reduce((sum, price) => sum + price, 0) / filteredPrices.length).toFixed(2);
        conditionAnalysis.push({
          condition: cond,
          averagePrice: parseFloat(averagePrice),
          itemCount: filteredPrices.length
        });
      }
    }

    const items = await makeEbayApiCall(params, accessToken, params.condition);
    console.log('Processed items:', items);

    const prices = items
      .filter(item => item.price && item.price.value)
      .map(item => parseFloat(item.price.value));
    const filteredPrices = calculatePriceOutliers(prices.filter(price => price >= minPrice));

    if (filteredPrices.length < minItems) {
      const fallbackResult = {
        averagePrice: filteredPrices.length > 0 ? (filteredPrices.reduce((sum, price) => sum + price, 0) / filteredPrices.length).toFixed(2) : 0,
        itemCount: filteredPrices.length,
        priceRange: filteredPrices.length > 0 ? {
          min: Math.min(...filteredPrices).toFixed(2),
          max: Math.max(...filteredPrices).toFixed(2)
        } : { min: 0, max: 0 },
        priceHistory: items
          .filter(item => item.price && item.price.value && parseFloat(item.price.value) >= minPrice)
          .map(item => ({
            date: item.lastSoldDate || new Date().toISOString().split('T')[0],
            price: parseFloat(item.price.value)
          })),
        sampleSize: filteredPrices.length,
        dateRange: items.length > 0 ? 
          `${items[items.length - 1].lastSoldDate || 'Unknown'} - ${items[0].lastSoldDate || 'Unknown'}` : 
          null,
        source: 'eBay Marketplace Insights API (Sandbox)',
        conditionAnalysis,
        timestamp: new Date().toISOString(),
        warning: filteredPrices.length > 0 ? 'Limited data available; results may be less reliable' : 'Insufficient relevant items found'
      };
      cacheService.cachePriceCheckResult(params, fallbackResult);
      return res.status(200).json(fallbackResult);
    }

    const averagePrice = (filteredPrices.reduce((sum, price) => sum + price, 0) / filteredPrices.length).toFixed(2);
    const result = {
      averagePrice: parseFloat(averagePrice),
      itemCount: filteredPrices.length,
      priceRange: {
        min: Math.min(...filteredPrices).toFixed(2),
        max: Math.max(...filteredPrices).toFixed(2)
      },
      priceHistory: items
        .filter(item => item.price && item.price.value && parseFloat(item.price.value) >= minPrice)
        .map(item => ({
          date: item.lastSoldDate || new Date().toISOString().split('T')[0],
          price: parseFloat(item.price.value)
        })),
      sampleSize: filteredPrices.length,
      dateRange: items.length > 0 ? 
        `${items[items.length - 1].lastSoldDate || 'Unknown'} - ${items[0].lastSoldDate || 'Unknown'}` : 
        null,
      source: 'eBay Marketplace Insights API (Sandbox)',
      conditionAnalysis,
      timestamp: new Date().toISOString()
    };

    console.log('Processed API result:', result);
    cacheService.cachePriceCheckResult(params, result);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in price check:', error.message);
    return res.status(500).json({ error: error.message });
  }
};

// Export getEbayOAuthToken for testing
module.exports.getEbayOAuthToken = getEbayOAuthToken;