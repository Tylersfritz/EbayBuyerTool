
// public/mercari-content.js
console.log('DealHavenAI Mercari Extension loaded');

try {
  if (typeof browser === 'undefined' && typeof chrome !== 'undefined') {
    var browser = chrome;
  }
} catch (e) {
  console.error('Browser API initialization error:', e);
}

const api = typeof browser !== 'undefined' ? browser : chrome;

// Listen for test mode messages
api.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'testModeGetListingInfo') {
    console.log('Test mode message received in Mercari content script');
    sendResponse({ testMode: true, status: 'Mercari content script accessible' });
    return true;
  }
});

if (window.location.href.includes('mercari.com/item/')) {
  api.runtime.sendMessage({ action: 'onMercariListing' });

  api.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getListingInfo') {
      try {
        const itemIdMatch = window.location.href.match(/\/item\/([^\/]+)/) || window.location.href.match(/\/([^\/]+)$/);
        const itemId = itemIdMatch ? itemIdMatch[1] : '';
        console.log(`Extracting data for Mercari item: ${itemId}`);

        // --- Title extraction ---
        let title = '';
        const titleSelectors = [
          'h1.mer-spacing-b-2',
          'h1.item-name',
          'h1[data-testid="item-name"]',
          'h1'
        ];
        for (const selector of titleSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent.trim()) {
            title = element.textContent.trim();
            console.log(`Title found with selector: ${selector}`);
            break;
          }
        }
        if (!title) {
          title = document.title.replace(' | Mercari', '').trim();
          console.log('Using page title as fallback');
        }

        // --- Price extraction ---
        let priceText = '';
        let price = 0;
        const priceSelectors = [
          'p.mer-text-title-lg',
          'p[data-testid="price"]',
          'div.mer-price-box p',
          'div.item-price p'
        ];
        for (const selector of priceSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent.trim()) {
            priceText = element.textContent.trim();
            console.log(`Price found with selector: ${selector}, raw text: ${priceText}`);
            const priceMatch = priceText.match(/\d{1,3}(,\d{3})*(\.\d{2})?/);
            price = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : 0;
            break;
          }
        }
        if (price === 0) {
          console.warn('Price extraction failed, defaulting to 0');
        }

        // --- Seller information ---
        let seller = '';
        const sellerSelectors = [
          'a.mer-text-body-2',
          'a[data-testid="seller-name"]',
          'div.item-detail-seller a'
        ];
        for (const selector of sellerSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent.trim()) {
            seller = element.textContent.trim();
            console.log(`Seller found with selector: ${selector}`);
            break;
          }
        }

        // --- Condition ---
        let condition = '';
        const conditionSelectors = [
          'div[data-testid="item-condition"]',
          'div.item-condition span',
          'span.item-condition-text'
        ];
        for (const selector of conditionSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent.trim()) {
            condition = element.textContent.trim();
            console.log(`Condition found with selector: ${selector}`);
            break;
          }
        }

        // --- Shipping ---
        let shipping = '';
        const shippingSelectors = [
          'div[data-testid="shipping-burden"]',
          'div.shipping-burden span',
          'span.shipping-burden-text'
        ];
        for (const selector of shippingSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent.trim()) {
            shipping = element.textContent.trim();
            console.log(`Shipping found with selector: ${selector}`);
            break;
          }
        }

        // Construct response object
        const responseData = {
          itemId,
          title,
          price,
          seller,
          condition,
          shipping
        };

        console.log('Extracted Mercari listing data:', responseData);
        sendResponse(responseData);
      } catch (error) {
        console.error('Error extracting Mercari listing information:', error);
        sendResponse({
          title: document.title.replace(' | Mercari', ''),
          price: 0,
          error: 'Failed to extract complete listing information',
          errorDetails: error.message
        });
      }
      return true; // Required for async response
    }
  });
}
