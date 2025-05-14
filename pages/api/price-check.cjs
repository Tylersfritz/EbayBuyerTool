const fetch = require('node-fetch');

module.exports = async (req, res) => {
  try {
    const { itemName, itemId, condition, premium } = req.query;

    // Use EBAY_API_TOKEN directly
    const token = process.env.EBAY_API_TOKEN;
    if (!token) {
      throw new Error("EBAY_API_TOKEN is not set");
    }

    // Debug: Log the token (first 10 characters for safety)
    console.log(`Using token: ${token.substring(0, 10)}...`);

    // Step 1: If itemId is provided, fetch item specifics using Browse API
    let model = null;
    let categoryId = null;
    if (itemId) {
      const browseResponse = await fetch(
        `https://api.sandbox.ebay.com/buy/browse/v1/item/v1|${itemId}|0`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "X-EBAY-C-MARKETPLACE-ID": "EBAY_US"
          },
        }
      );

      if (!browseResponse.ok) {
        const errorText = await browseResponse.text();
        throw new Error(`Failed to fetch item details: ${browseResponse.status}, Details: ${errorText}`);
      }

      const browseData = await browseResponse.json();

      // Debug: Log the Browse API response
      console.log(`Browse API Response: ${JSON.stringify(browseData).substring(0, 500)}...`);

      // Extract item specifics (e.g., model)
      if (browseData.localizedAspects) {
        const modelAspect = browseData.localizedAspects.find(aspect => aspect.name.toLowerCase() === "model");
        model = modelAspect ? modelAspect.value : null;
      }

      // Extract category ID
      if (browseData.categoryPath) {
        const categoryPath = browseData.categoryPath.split("|");
        categoryId = categoryPath[categoryPath.length - 1]; // Last part is the category ID
      }
    }

    // Step 2: Construct the Market Insights API query
    let queryParam = itemId ? `itemIds=${itemId}` : `q=${encodeURIComponent(itemName)}`;
    let additionalParams = `&condition=${condition}&fieldgroups=ASPECT_REFINEMENTS`;
    if (categoryId) {
      additionalParams += `&categoryId=${categoryId}`;
    }
    if (model && categoryId) {
      additionalParams += `&aspectFilter=categoryId:${categoryId},model:${encodeURIComponent(model)}`;
    }

    const marketInsightsUrl = `https://api.sandbox.ebay.com/buy/marketplace_insights/v1_beta/item_sales/search?${queryParam}${additionalParams}`;

    // Call the Market Insights API
    const response = await fetch(marketInsightsUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_US"
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch eBay data: ${response.status}, Details: ${errorText}`);
    }

    const data = await response.json();

    // Debug: Log the raw API response
    console.log(`Market Insights API Response: ${JSON.stringify(data).substring(0, 500)}...`);

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