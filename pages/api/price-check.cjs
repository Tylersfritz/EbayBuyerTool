const fetch = require('node-fetch');

module.exports = async (req, res) => {
  try {
    const { itemName, condition, premium } = req.query;

    // Check if EBAY_API_TOKEN is available
    let token = process.env.EBAY_API_TOKEN;
    if (!token) {
      // Fetch a new token using sandbox credentials
      const clientId = process.env.EBAY_CLIENT_ID_SBX;
      const clientSecret = process.env.EBAY_CLIENT_SECRET_SBX;
      if (!clientId || !clientSecret) {
        throw new Error("EBAY_CLIENT_ID_SBX or EBAY_CLIENT_SECRET_SBX is not set");
      }

      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const tokenResponse = await fetch('https://api.sandbox.ebay.com/identity/v1/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${auth}`,
        },
        body: 'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope%2Fbuy.marketplace.insights',
      });

      if (!tokenResponse.ok) {
        throw new Error(`Failed to fetch eBay token: ${tokenResponse.status}`);
      }

      const tokenData = await tokenResponse.json();
      token = tokenData.access_token;
    }

    // Use the token to call the Market Insights API
    const response = await fetch(
      `https://api.sandbox.ebay.com/buy/marketplace_insights/v1_beta/item_sales/search?q=${encodeURIComponent(itemName)}&condition=${condition}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch eBay data: ${response.status}`);
    }

    const data = await response.json();
    // Process the data to calculate the auction market rate
    // (Replace with your actual logic)
    const marketRate = "calculated-value"; // Placeholder

    res.status(200).json({ marketRate });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};