// api/price-check.js
const cacheService = require('./cache-service');
const fetch = require('node-fetch');

async function getEbayOAuthToken(clientId, clientSecret) {
  try {
    console.log('Attempting to fetch eBay OAuth token'); // Debug log
    console.log('Client ID (partial):', clientId.slice(0, 10) + '...'); // Debug log (partial for security)
    const authHeader = 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64');
    console.log('Authorization header (partial):', authHeader.slice(0, 10) + '...'); // Debug log (partial)
    const response = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: authHeader
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        scope: 'https://api.ebay.com/oauth/api_scope'
      })
    });
    const data = await response.json();
    console.log('eBay OAuth Token Response:', data); // Debug log
    if (!response.ok) {
      console.error('eBay OAuth Error:', {
        status: response.status,
        statusText: response.statusText,
        error: data.error,
        error_description: data.error_description
      }); // Detailed error log
      throw new Error(`Failed to fetch eBay token: ${response.status}`);
    }
    return data.access_token;
  } catch (error) {
    console.error('getEbayOAuthToken Error:', error.message); // Debug log
    throw error;
  }
}

function mapConditionToEbayFormat(condition) {
  const conditionMap = {
    NEW: '1000',
    USED: '2000|2010|2020|2030|2500',
    REFURBISHED: '3000'
  };
  return conditionMap[condition.toUpperCase()] || '1000';
}

function buildConditionFilter(ebayCondition) {
  return `conditionIds:{${ebayCondition}}`;
}

async function makeEbayApiCall(params, accessToken) {
  try {
    let url = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(params.itemName)}&limit=10`;
    if (params.condition) {
      const ebayCondition = mapConditionToEbayFormat(params.condition);
      const conditionFilter = buildConditionFilter(ebayCondition);
      url += `&filter=${conditionFilter}`;
      console.log(`Using condition filter: ${conditionFilter}`); // Debug log
    }
    console.log('eBay API Request URL:', url); // Debug log
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = await response.json();
    console.log('eBay API Response:', data); // Debug log
    if (!response.ok) {
      console.error('eBay API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: data.error,
        error_description: data.error_description
      }); // Detailed error log
      throw new Error(`Failed to fetch eBay data: ${response.status}`);
    }
    return data.itemSummaries || [];
  } catch (error) {
    console.error('makeEbayApiCall Error:', error.message); // Debug log
    throw error;
  }
}

module.exports = async function (req, res) {
  const params = req.query;
  console.log('Received params:', params); // Debug log

  const cachedResult = cacheService.getCachedPriceCheck(params);
  if (cachedResult) {
    console.log('Returning cached price check result'); // Debug log
    return res.status(200).json(cachedResult);
  }

  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Missing eBay API credentials'); // Debug log
    return res.status(500).json({ error: 'Missing eBay API credentials' });
  }

  try {
    const accessToken = await getEbayOAuthToken(clientId, clientSecret);
    const items = await makeEbayApiCall(params, accessToken);
    console.log('Processed items:', items); // Debug log

    const prices = items
      .filter(item => item.price && item.price.value)
      .map(item => parseFloat(item.price.value));
    const averagePrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
    const priceHistory = items
      .filter(item => item.price && item.price.value)
      .map(item => ({
        date: item.lastSoldDate || new Date().toISOString().split('T')[0],
        price: parseFloat(item.price.value)
      }));

    const result = {
      averagePrice,
      priceHistory,
      sampleSize: prices.length,
      dateRange: prices.length > 0 ? `${items[items.length - 1].lastSoldDate || 'Unknown'} - ${items[0].lastSoldDate || 'Unknown'}` : null,
      source: 'eBay Browse API',
      itemCount: items.length,
      timestamp: new Date().toISOString()
    };

    cacheService.cachePriceCheckResult(params, result);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in price check:', error.message); // Debug log
    return res.status(500).json({ error: error.message });
  }
};