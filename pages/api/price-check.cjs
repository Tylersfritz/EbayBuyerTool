
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  try {
    // Parse request parameters
    const method = req.method.toUpperCase();
    const params = method === 'GET' ? req.query : method === 'POST' ? req.body : {};
    const { itemName, itemId, condition, premium, model, brand } = params;

    // Get API environment configuration from headers or use defaults
    let apiConfig = {
      browseApi: 'production',
      marketInsightsApi: 'sandbox'
    };

    try {
      const configHeader = req.headers['x-api-config'];
      if (configHeader) {
        apiConfig = JSON.parse(configHeader);
      }
    } catch (e) {
      console.warn('Failed to parse API config header, using defaults');
    }

    console.log(`API Config: Browse API (${apiConfig.browseApi}), Market Insights (${apiConfig.marketInsightsApi})`);

    // Use EBAY_API_TOKEN directly for simplicity in this implementation
    // In a production environment, we would use separate tokens for each environment
    const token = process.env.EBAY_API_TOKEN;
    if (!token) {
      throw new Error("EBAY_API_TOKEN is not set");
    }

    // Debug: Log the token (first 10 characters for safety)
    console.log(`Using token: ${token.substring(0, 10)}...`);

    // Step 1: Fetch item specifics using Browse API if itemId is provided
    let make = null;
    let model = null;
    let categoryId = null;
    let keywordQuery = itemName;
    let itemData = null;
    let dataSourceInfo = {
      browseApiSuccess: false,
      marketInsightsApiSuccess: false,
      browseApiEnvironment: apiConfig.browseApi,
      marketInsightsApiEnvironment: apiConfig.marketInsightsApi
    };

    if (itemId) {
      // Determine which endpoint to use based on the environment config
      const browseApiEndpoint = apiConfig.browseApi === 'production'
        ? 'https://api.ebay.com/buy/browse/v1/item'
        : 'https://api.sandbox.ebay.com/buy/browse/v1/item';

      const browseResponse = await fetch(
        `${browseApiEndpoint}/v1|${itemId}|0`,
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
        console.error(`Failed to fetch item details: ${browseResponse.status}, Details: ${errorText}`);
        // We'll continue with what we have rather than failing completely
      } else {
        dataSourceInfo.browseApiSuccess = true;
        const browseData = await browseResponse.json();
        itemData = browseData;

        // Debug: Log the Browse API response
        console.log(`Browse API Response: ${JSON.stringify(browseData).substring(0, 500)}...`);

        // Extract item specifics (e.g., make, model)
        if (browseData.localizedAspects) {
          const makeAspect = browseData.localizedAspects.find(aspect => aspect.name.toLowerCase() === "brand" || aspect.name.toLowerCase() === "make");
          const modelAspect = browseData.localizedAspects.find(aspect => aspect.name.toLowerCase() === "model");
          make = makeAspect ? makeAspect.value : null;
          model = modelAspect ? modelAspect.value : null;
        }

        // Extract category ID
        if (browseData.categoryPath) {
          const categoryPath = browseData.categoryPath.split("|");
          categoryId = categoryPath[categoryPath.length - 1]; // Last part is the category ID
        }

        // Construct a keyword query from item specifics
        keywordQuery = [make, model].filter(Boolean).join(" ") || itemName;
      }
    } else {
      // If no itemId is provided, use the provided model and brand
      make = brand;
      model = params.model;
      keywordQuery = [make, model].filter(Boolean).join(" ") || itemName;
    }

    // Step 2: Construct the Market Insights API query using keywords
    let additionalParams = `&condition=${condition || 'USED'}&fieldgroups=ASPECT_REFINEMENTS`;
    if (categoryId) {
      additionalParams += `&categoryId=${categoryId}`;
    }
    if (make && categoryId) {
      additionalParams += `&aspectFilter=categoryId:${categoryId},brand:${encodeURIComponent(make)}`;
    }
    if (model && categoryId) {
      additionalParams += `,model:${encodeURIComponent(model)}`;
    }

    // Always use sandbox for Market Insights API as specified by the client
    const marketInsightsUrl = `https://api.sandbox.ebay.com/buy/marketplace_insights/v1_beta/item_sales/search?q=${encodeURIComponent(keywordQuery)}${additionalParams}`;

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

    dataSourceInfo.marketInsightsApiSuccess = true;
    const data = await response.json();

    // Debug: Log the raw API response
    console.log(`Market Insights API Response: ${JSON.stringify(data).substring(0, 500)}...`);

    // Calculate the market rate (average of recent sale prices)
    if (!data.itemSales || data.itemSales.length === 0) {
      throw new Error("No sales data found for similar items");
    }

    const prices = data.itemSales
      .filter(sale => sale.lastSoldPrice && sale.lastSoldPrice.value) // Ensure price exists
      .map(sale => parseFloat(sale.lastSoldPrice.value)); // Extract price as a number

    if (prices.length === 0) {
      throw new Error("No valid price data found in sales");
    }

    // Calculate price statistics
    const marketRate = (prices.reduce((sum, price) => sum + price, 0) / prices.length).toFixed(2);
    const minPrice = Math.min(...prices).toFixed(2);
    const maxPrice = Math.max(...prices).toFixed(2);
    
    // Format a simplified price history from the data
    const priceHistory = data.itemSales
      .filter(sale => sale.lastSoldPrice && sale.lastSoldPrice.value && sale.lastSoldDate)
      .map(sale => ({
        date: sale.lastSoldDate.split('T')[0], // Just keep the date part
        price: parseFloat(sale.lastSoldPrice.value)
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 10); // Limit to 10 entries for simplicity

    // Return enhanced response with data quality indicators
    res.status(200).json({
      marketRate: parseFloat(marketRate),
      averagePrice: parseFloat(marketRate),
      priceRange: { min: parseFloat(minPrice), max: parseFloat(maxPrice) },
      itemCount: prices.length,
      timestamp: new Date().toISOString(),
      priceHistory: priceHistory,
      sampleSize: prices.length,
      dateRange: priceHistory.length > 0 
        ? `${priceHistory[0].date} - ${priceHistory[priceHistory.length-1].date}` 
        : null,
      source: "eBay Market Insights API (Sandbox)",
      dataQuality: {
        confidence: dataSourceInfo.browseApiSuccess && dataSourceInfo.marketInsightsApiSuccess ? 'high' : 'medium',
        sources: [
          `eBay Browse API (${dataSourceInfo.browseApiEnvironment})${dataSourceInfo.browseApiSuccess ? '' : ' - Failed'}`,
          `eBay Market Insights API (${dataSourceInfo.marketInsightsApiEnvironment})${dataSourceInfo.marketInsightsApiSuccess ? '' : ' - Failed'}`
        ],
        itemSpecifics: {
          make,
          model,
          category: categoryId
        },
        warning: dataSourceInfo.browseApiSuccess ? null : "Could not retrieve detailed item information"
      }
    });
    
  } catch (error) {
    console.error("Price check API error:", error);
    res.status(500).json({ 
      error: error.message,
      averagePrice: 0,
      itemCount: 0,
      timestamp: new Date().toISOString(),
      priceRange: { min: 0, max: 0 }
    });
  }
};
