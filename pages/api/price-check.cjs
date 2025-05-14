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

    // Call the Market Insights API with the required header
    const response = await fetch(
      `https://api.sandbox.ebay.com/buy/marketplace_insights/v1_beta/item_sales/search?q=${encodeURIComponent(itemName)}&condition=${condition}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-EBAY-C-MARKETPLACE-ID": "EBAY_US"
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch eBay data: ${response.status}, Details: ${errorText}`);
    }

    const data = await response.json();

    // Calculate the market rate (average of recent sale prices)
    if (!data.itemSales || data.itemSales.length === 0) {
      throw new Error("No sales data found for the item");
    }

    const prices = data.itemSales
      .filter(sale => sale.lastSoldPrice && sale.lastSoldPrice.value) // Ensure price exists
      .map(sale => parseFloat(sale.lastSoldPrice.value)); // Extract price as a number

    if (prices.length === 0) {
      throw new Error("No valid price data found in sales");
    }

    const marketRate = (prices.reduce((sum, price) => sum + price, 0) / prices.length).toFixed(2);

    res.status(200).json({ marketRate });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};