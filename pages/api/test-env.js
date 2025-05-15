
export default async function handler(req, res) {
  try {
    // Check if the EBAY_API_TOKEN is defined
    const token = process.env.EBAY_API_TOKEN;
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: "No eBay API token found in environment variables",
        environment: process.env.NODE_ENV
      });
    }
    
    // Make a simple call to verify token works with sandbox API
    const testCall = await fetch('https://api.sandbox.ebay.com/commerce/taxonomy/v1/get_default_category_tree_id?marketplace_id=EBAY_US', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Get response status and some data
    const testStatus = testCall.status;
    const testData = testCall.ok ? await testCall.json() : await testCall.text();
    
    res.status(200).json({ 
      success: testCall.ok,
      token: `${token.substring(0, 10)}...`, // First 10 chars of token
      testApiCall: {
        endpoint: 'get_default_category_tree_id',
        status: testStatus,
        response: testCall.ok ? testData : 'Error: ' + testData
      },
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: `API test failed: ${error.message}`,
      environment: process.env.NODE_ENV
    });
  }
}
