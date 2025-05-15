
// api/utils/oauthUtils.js
const fetch = require('node-fetch');

/**
 * Gets an eBay OAuth token using client credentials for a specific environment
 * @param {string} clientId - eBay API client ID
 * @param {string} clientSecret - eBay API client secret
 * @param {'production'|'sandbox'} environment - API environment
 * @returns {Promise<{token: string, expiresAt: number}>} Access token and expiry timestamp
 */
async function getEbayOAuthToken(clientId, clientSecret, environment = 'production') {
  if (!clientId || !clientSecret) {
    throw new Error('Missing eBay credentials: EBAY_CLIENT_ID or EBAY_CLIENT_SECRET not set');
  }

  const endpoint = environment === 'production'
    ? 'https://api.ebay.com/identity/v1/oauth2/token'
    : 'https://api.sandbox.ebay.com/identity/v1/oauth2/token';

  console.log(`Fetching eBay OAuth token for ${environment} environment`);
  
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: 'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Token fetch failed for ${environment}: Status=${response.status}, Response=${errorText}`);
    throw new Error(`eBay authentication failed for ${environment}: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log(`eBay OAuth token fetched successfully for ${environment}`);
  
  // Calculate expiry timestamp (subtract 5 minutes for safety margin)
  const expiresAtMs = Date.now() + (data.expires_in * 1000) - (5 * 60 * 1000);
  
  return {
    token: data.access_token,
    expiresAt: expiresAtMs
  };
}

/**
 * Token cache to avoid unnecessary API calls
 */
const tokenCache = {
  production: {
    token: null,
    expiresAt: 0
  },
  sandbox: {
    token: null,
    expiresAt: 0
  }
};

/**
 * Gets a cached token or fetches a new one if needed
 * @param {string} clientId - eBay API client ID
 * @param {string} clientSecret - eBay API client secret
 * @param {'production'|'sandbox'} environment - API environment
 * @returns {Promise<string>} Access token
 */
async function getEbayToken(clientId, clientSecret, environment = 'production') {
  const cache = tokenCache[environment];
  const now = Date.now();
  
  // Return cached token if it's still valid
  if (cache.token && cache.expiresAt > now) {
    console.log(`Using cached ${environment} token valid for another ${Math.floor((cache.expiresAt - now) / 1000)} seconds`);
    return cache.token;
  }
  
  // Fetch new token
  try {
    const { token, expiresAt } = await getEbayOAuthToken(clientId, clientSecret, environment);
    
    // Update cache
    tokenCache[environment] = { token, expiresAt };
    
    return token;
  } catch (error) {
    console.error(`Failed to get eBay token for ${environment}:`, error);
    throw error;
  }
}

module.exports = {
  getEbayOAuthToken,
  getEbayToken
};
