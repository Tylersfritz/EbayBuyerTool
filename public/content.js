
// public/content.js
console.log('DealHavenAI Extension loaded');

try {
  if (typeof browser === 'undefined' && typeof chrome !== 'undefined') {
    var browser = chrome;
  }
} catch (e) {
  console.error('Browser API initialization error:', e);
}

const api = typeof browser !== 'undefined' ? browser : chrome;

// Listen for test mode messages even if not on eBay
api.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'testModeGetListingInfo') {
    console.log('Test mode message received in content script');
    sendResponse({ testMode: true, status: 'Content script accessible' });
    return true;
  }
});

if (window.location.href.includes('ebay.com/itm/')) {
  console.log('DealHavenAI: eBay listing detected at:', window.location.href);
  api.runtime.sendMessage({ action: 'onEbayListing' });

  api.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getListingInfo') {
      try {
        const itemIdMatch = window.location.href.match(/\/(\d+)\?/) || window.location.href.match(/\/(\d+)$/);
        const itemId = itemIdMatch ? itemIdMatch[1] : '';
        console.log(`Extracting data for eBay item: ${itemId}`);

        // --- Title extraction ---
        let title = '';
        const titleSelectors = [
          'h1.x-item-title__mainTitle span',
          'h1 span.ux-textspans--BOLD',
          'h1.item-title span',
          'h1[itemprop="name"]',
          '.x-item-title'
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
          title = document.title.replace(' | eBay', '').trim();
          console.log('Using page title as fallback');
        }

        // --- Price extraction ---
        let priceText = '';
        let price = 0;
        const priceSelectors = [
          'div.x-price-primary span',
          'span.notranslate[itemprop="price"]',
          'span#prcIsum',
          'span#prcIsum_bidPrice',
          '[data-testid="x-price-primary"]',
          'div[data-testid="x-bin-price"] span.ux-textspans',
          'div[data-testid="x-price"] span',
          '.x-price-section span'
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
          'span.mbg-nw',
          'div.ux-seller-section__item--seller a span',
          '[data-testid="ux-seller-section__item--seller"] a span',
          'span[data-testid="x-sellercard-id"] a'
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
          'div.x-item-condition-text span',
          'div.d-item-condition span.ux-textspans',
          'div[data-testid="x-item-condition"] span',
          'span.condText',
          'span[data-testid="x-item-condition-label"]',
          'div.ux-layout-section__textual-display span.ux-textspans:first-child'
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
          'div.vim-logistics span.ux-textspans',
          'div.d-shipping-minview span.ux-textspans',
          '[data-testid="x-shipping"] span.ux-textspans',
          '[data-testid="x-delivery"] span.ux-textspans',
          '[data-testid="x-shipping-speed"] span.ux-textspans'
        ];
        for (const selector of shippingSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent.trim()) {
            shipping = element.textContent.trim();
            console.log(`Shipping found with selector: ${selector}`);
            break;
          }
        }

        // --- Item specifics ---
        const itemSpecifics = {};
        const detailsSelectors = [
          'div.ux-layout-section__item-details',
          'div.ux-layout-section__row',
          'div.item-specifics'
        ];
        let detailsSection = null;
        for (const selector of detailsSelectors) {
          detailsSection = document.querySelector(selector);
          if (detailsSection) {
            console.log(`Details section found with selector: ${selector}`);
            break;
          }
        }
        if (detailsSection) {
          const detailRows = detailsSection.querySelectorAll('div.ux-labels-values__labels-content');
          if (detailRows.length > 0) {
            detailRows.forEach(row => {
              const label = row.textContent.trim();
              const valueElement = row.nextElementSibling;
              if (valueElement) {
                const value = valueElement.textContent.trim();
                itemSpecifics[label] = value;
              }
            });
          } else {
            const itemRows = detailsSection.querySelectorAll('div.ux-labels-values__row');
            itemRows.forEach(row => {
              const labelEl = row.querySelector('.ux-labels-values__labels');
              const valueEl = row.querySelector('.ux-labels-values__values');
              if (labelEl && valueEl) {
                const label = labelEl.textContent.trim();
                const value = valueEl.textContent.trim();
                if (label && value) {
                  itemSpecifics[label] = value;
                }
              }
            });
          }
        }

        // --- Bids information ---
        let hasBids = false;
        let bidsCount = 0;
        const bidsSelectors = [
          'span.vi-bids',
          'div.x-bid-count',
          '[data-testid="x-bid-count"]'
        ];
        for (const selector of bidsSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent.trim()) {
            hasBids = true;
            const bidsText = element.textContent.trim();
            const bidsMatch = bidsText.match(/\d+/);
            bidsCount = bidsMatch ? parseInt(bidsMatch[0]) : 0;
            console.log(`Bids found with selector: ${selector}`);
            break;
          }
        }

        // --- Buy It Now ---
        let hasBuyItNow = false;
        const buyNowSelectors = [
          'a.vi-bin-button',
          'div[data-testid="x-bin-action"]',
          'div.x-bin-action'
        ];
        for (const selector of buyNowSelectors) {
          if (document.querySelector(selector)) {
            hasBuyItNow = true;
            console.log(`Buy It Now found with selector: ${selector}`);
            break;
          }
        }

        // --- Listing end time ---
        let endTime = '';
        const endTimeSelectors = [
          'span.vi-tm-left',
          'span[data-testid="x-time-left"]',
          'div.x-time-left span'
        ];
        for (const selector of endTimeSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent.trim()) {
            endTime = element.textContent.trim();
            console.log(`End time found with selector: ${selector}`);
            break;
          }
        }

        // --- Location ---
        let location = '';
        const locationSelectors = [
          'div.ux-layout-section__item--location span.ux-textspans',
          'div.x-item-location',
          '[data-testid="x-item-location"] span'
        ];
        for (const selector of locationSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            const nextEl = element.nextElementSibling;
            if (nextEl) {
              location = nextEl.textContent.trim();
            } else {
              location = element.textContent.replace('Item location:', '').trim();
            }
            console.log(`Location found with selector: ${selector}`);
            break;
          }
        }

        // --- Quantity available ---
        let quantityAvailable = 1;
        const quantitySelectors = [
          'span[id$="_qtyId"]',
          '[data-testid="x-quantity"] span'
        ];
        for (const selector of quantitySelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent.trim()) {
            quantityAvailable = parseInt(element.textContent.trim()) || 1;
            console.log(`Quantity found with selector: ${selector}`);
            break;
          }
        }

        // --- Return policy ---
        let returnPolicy = '';
        const returnSelectors = [
          'div.vim-returns-policy span.ux-textspans',
          'div.x-returns-policy span'
        ];
        for (const selector of returnSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent.trim()) {
            returnPolicy = element.textContent.trim();
            console.log(`Return policy found with selector: ${selector}`);
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
          shipping,
          returnPolicy,
          itemSpecifics,
          listingType: {
            isAuction: hasBids,
            bidsCount,
            hasBuyItNow,
            endTime
          },
          location,
          quantityAvailable
        };

        console.log('Extracted listing data:', responseData);
        sendResponse(responseData);
      } catch (error) {
        console.error('Error extracting listing information:', error);
        sendResponse({
          title: document.title.replace(' | eBay', ''),
          price: 0,
          error: 'Failed to extract complete listing information',
          errorDetails: error.message
        });
      }
      return true; // Required for async response
    }
  });
}
