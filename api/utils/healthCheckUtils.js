
// api/utils/healthCheckUtils.js
const fetch = require('node-fetch');

/**
 * Tests the eBay Buy API access using the provided access token
 * @param {string} accessToken - eBay OAuth access token
 * @returns {Promise<boolean>} True if API access is successful
 */
async function testEbayApiAccess(accessToken) {
  console.log('Testing eBay Buy API access');
  // Use conditionIds filter format for consistency with price-check.js
  const testUrl = 'https://api.ebay.com/buy/browse/v1/item_summary/search?q=test&filter=conditionIds:{2000|2010|2020|2030|2500}&limit=1';
  
  console.log(`Making test API call to: ${testUrl}`);
  
  const response = await fetch(testUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-EBAY-API-SITEID': '0',
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`eBay API test call failed: Status=${response.status}, Response=${errorText}`);
    throw new Error(`eBay API access failed: ${response.status} - ${errorText}`);
  }
  
  console.log('eBay API access test successful');
  return true;
}

/**
 * Sets CORS headers on the response
 * @param {Object} res - Express response object
 */
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = {
  testEbayApiAccess,
  setCorsHeaders
};
