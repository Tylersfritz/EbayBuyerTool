
// api/health.js
const { getEbayOAuthToken } = require('./utils/oauthUtils');
const { testEbayApiAccess, setCorsHeaders } = require('./utils/healthCheckUtils');

module.exports = async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method !== 'GET') {
      return res.status(405).json({
        status: 'ERROR',
        ebayAuth: false,
        ebayApiAccess: false,
        error: 'Method not allowed',
      });
    }

    const clientId = process.env.EBAY_CLIENT_ID;
    const clientSecret = process.env.EBAY_CLIENT_SECRET;

    // Check if credentials are available
    if (!clientId || !clientSecret) {
      console.error('Missing eBay credentials: EBAY_CLIENT_ID or EBAY_CLIENT_SECRET not set');
      return res.status(500).json({
        status: 'OK',
        ebayAuth: false,
        ebayApiAccess: false,
        error: 'Server configuration error: Missing eBay API credentials',
      });
    }

    try {
      // Get OAuth token
      const accessToken = await getEbayOAuthToken(clientId, clientSecret);
      
      // Test API access
      await testEbayApiAccess(accessToken);
      
      // Both steps succeeded
      return res.status(200).json({
        status: 'OK',
        ebayAuth: true,
        ebayApiAccess: true,
      });
    } catch (error) {
      // Determine which step failed based on the error message
      const isAuthError = error.message.includes('authentication') || error.message.includes('credentials');
      
      return res.status(401).json({
        status: 'OK',
        ebayAuth: !isAuthError,
        ebayApiAccess: false,
        error: error.message,
      });
    }
  } catch (error) {
    console.error('Health check error:', error);
    return res.status(500).json({
      status: 'ERROR',
      ebayAuth: false,
      ebayApiAccess: false,
      error: 'Internal server error: ' + (error.message || 'Unknown error'),
    });
  }
};
