const fetch = require('node-fetch');

module.exports = async (req, res) => {
  try {
    const { itemName, condition, premium } = req.query;

    // Use EBAY_API_TOKEN directly
    const token = process.env.EBAY_API_TOKEN;
    if (!token) {
      throw new Error("EBAY_API_TOKEN is not set");
    }

    // Debug: Log the token (first 10 characters for safety)
    console.log(`Using token: ${token.substring(0, 10)}...`);

    // Call the Market Insights API
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
      const errorText = await response.text();
      throw new Error(`Failed to fetch eBay data: ${response.status}, Details: ${errorText}`);
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