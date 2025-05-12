
// api/utils/oauthUtils.js
const fetch = require('node-fetch');

/**
 * Gets an eBay OAuth token using client credentials
 * @param {string} clientId - eBay API client ID
 * @param {string} clientSecret - eBay API client secret
 * @returns {Promise<string>} Access token
 */
async function getEbayOAuthToken(clientId, clientSecret) {
  if (!clientId || !clientSecret) {
    throw new Error('Missing eBay credentials: EBAY_CLIENT_ID or EBAY_CLIENT_SECRET not set');
  }

  console.log('Fetching eBay OAuth token for health check');
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
    throw new Error(`eBay authentication failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('eBay OAuth token fetched successfully');
  return data.access_token;
}

module.exports = {
  getEbayOAuthToken
};
