
/**
 * Utilities for testing with real eBay listings
 */

// Sample real eBay listings for testing different categories
export const realListings = [
  {
    category: "Electronics",
    items: [
      {
        title: "Sony WH-1000XM4 Wireless Noise Cancelling Headphones - Black",
        url: "https://www.ebay.com/itm/304107818471",
        expectedPrice: 249.99,
        itemSpecifics: {
          "Brand": "Sony",
          "Model": "WH-1000XM4",
          "Color": "Black",
          "Condition": "Used - Very Good",
          "Features": "Noise Cancellation, Wireless"
        },
        isAuction: false
      },
      {
        title: "Apple iPhone 13 Pro 128GB Sierra Blue Unlocked Good Condition",
        url: "https://www.ebay.com/itm/166274748589",
        expectedPrice: 599.99,
        itemSpecifics: {
          "Brand": "Apple",
          "Model": "iPhone 13 Pro",
          "Storage Capacity": "128GB",
          "Color": "Sierra Blue",
          "Condition": "Used - Good",
          "Network": "Unlocked"
        },
        isAuction: false
      },
      {
        title: "Sony PlayStation 5 Disc Edition Console - AUCTION",
        url: "https://www.ebay.com/itm/394673804299",
        expectedPrice: 399.99,
        itemSpecifics: {
          "Brand": "Sony",
          "Model": "PlayStation 5",
          "Type": "Disc Edition",
          "Condition": "Used - Excellent",
          "Included": "Console, Controller, Cables"
        },
        isAuction: true,
        currentBids: 12,
        timeRemaining: "2d 8h" 
      }
    ]
  },
  {
    category: "Home & Garden",
    items: [
      {
        title: "Keurig K-Elite Single Serve K-Cup Coffee Maker - Brushed Silver",
        url: "https://www.ebay.com/itm/394067373964",
        expectedPrice: 129.99,
        itemSpecifics: {
          "Brand": "Keurig",
          "Model": "K-Elite",
          "Color": "Brushed Silver",
          "Condition": "New",
          "Features": "Single Serve, Programmable"
        },
        isAuction: false
      },
      {
        title: "Dyson V8 Cordless Vacuum Cleaner | Refurbished",
        url: "https://www.ebay.com/itm/295543378723",
        expectedPrice: 199.99,
        itemSpecifics: {
          "Brand": "Dyson",
          "Model": "V8",
          "Type": "Cordless Vacuum",
          "Condition": "Refurbished",
          "Features": "HEPA Filtration, Wall Mount"
        },
        isAuction: false
      },
      {
        title: "Ninja Foodi 8-Quart Pressure Cooker - AUCTION ENDING SOON",
        url: "https://www.ebay.com/itm/295543378724",
        expectedPrice: 119.99,
        itemSpecifics: {
          "Brand": "Ninja",
          "Model": "Foodi",
          "Capacity": "8-Quart",
          "Condition": "Used - Like New",
          "Features": "Pressure Cook, Air Fry, Slow Cook"
        },
        isAuction: true,
        currentBids: 18,
        timeRemaining: "6h 15m"
      }
    ]
  },
  {
    category: "Collectibles",
    items: [
      {
        title: "LEGO Star Wars 75192 UCS Millennium Falcon - New Sealed",
        url: "https://www.ebay.com/itm/354165444940",
        expectedPrice: 849.99,
        itemSpecifics: {
          "Brand": "LEGO",
          "Theme": "Star Wars",
          "Set Number": "75192",
          "Name": "UCS Millennium Falcon",
          "Condition": "New - Sealed",
          "Piece Count": "7541"
        },
        isAuction: false
      },
      {
        title: "Pokémon Charizard Base Set Holo Card - PSA 8 Near Mint",
        url: "https://www.ebay.com/itm/394673804298",
        expectedPrice: 359.99,
        itemSpecifics: {
          "Brand": "Pokemon",
          "Card Name": "Charizard",
          "Set": "Base Set",
          "Card Number": "4/102",
          "Condition": "PSA 8 Near Mint",
          "Rarity": "Holo Rare"
        },
        isAuction: false
      },
      {
        title: "Vintage Magic The Gathering Black Lotus Card - RARE AUCTION",
        url: "https://www.ebay.com/itm/394673804300",
        expectedPrice: 10000.00,
        itemSpecifics: {
          "Brand": "Wizards of the Coast",
          "Card Name": "Black Lotus",
          "Set": "Alpha",
          "Condition": "Good",
          "Rarity": "Mythic Rare"
        },
        isAuction: true,
        currentBids: 32,
        timeRemaining: "3d 12h"
      }
    ]
  }
];

// Function to extract item ID from eBay URL
export function extractEbayItemId(url: string): string | null {
  const regex = /\/(\d+)(?:\?|$)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Mock response generator based on real data
export function generateMockListingResponse(listing: {
  title: string;
  url: string;
  expectedPrice: number;
  itemSpecifics?: Record<string, string>;
  isAuction?: boolean;
  currentBids?: number;
  timeRemaining?: string;
}): Record<string, any> {
  const itemId = extractEbayItemId(listing.url);
  const isAuction = listing.isAuction === true;
  
  // Create default item specifics if not provided
  const defaultItemSpecifics = {
    'Brand': listing.title.split(' ')[0],
    'Model': listing.title.split(' ')[1],
    'Condition': Math.random() > 0.5 ? 'New' : 'Used - Very Good'
  };
  
  // Use provided item specifics or fall back to defaults
  const itemSpecifics = listing.itemSpecifics || defaultItemSpecifics;
  
  // Generate a seller rating based on a normal distribution around 99%
  const generateSellerRating = () => {
    const baseRating = 99;
    const variation = Math.random() * 2 - 1; // -1 to 1
    return Math.min(100, Math.max(90, baseRating + variation)).toFixed(1);
  };
  
  // Calculate appropriate pricing for auction listings
  let currentPrice = listing.expectedPrice;
  let buyItNowPrice = null;
  
  if (isAuction) {
    // Auctions typically start lower than market value
    const timeRemaining = listing.timeRemaining || "3d 0h";
    const isEndingSoon = timeRemaining.includes('h') && !timeRemaining.includes('d');
    
    // Calculate a realistic current bid based on time remaining
    if (isEndingSoon) {
      // Ending soon auctions typically at 80-95% of expected price
      currentPrice = listing.expectedPrice * (0.8 + Math.random() * 0.15);
    } else {
      // Early auctions typically at 60-80% of expected price
      currentPrice = listing.expectedPrice * (0.6 + Math.random() * 0.2);
    }
    
    // Buy it now price is typically 10-30% above expected price
    buyItNowPrice = listing.expectedPrice * (1.1 + Math.random() * 0.2);
  }
  
  // Generate bid count or quantity based on listing type
  const bidsCount = isAuction ? (listing.currentBids || Math.floor(Math.random() * 20)) : 0;
  const bidderCount = isAuction ? Math.min(bidsCount, Math.max(1, Math.floor(bidsCount * 0.7))) : 0;
  const quantityAvailable = isAuction ? 1 : Math.floor(Math.random() * 5) + 1;
  
  // Generate watchers count - higher for auctions and desirable items
  const isDesirable = listing.expectedPrice > 500;
  const watchersBase = isDesirable ? 15 : 5;
  const watchersVariation = isDesirable ? 30 : 10;
  const watchers = Math.floor(watchersBase + Math.random() * watchersVariation);
  
  return {
    itemId,
    title: listing.title,
    currentPrice: parseFloat(currentPrice.toFixed(2)),
    buyItNowPrice: buyItNowPrice ? parseFloat(buyItNowPrice.toFixed(2)) : null,
    seller: `seller_${Math.floor(Math.random() * 1000)}`,
    feedbackScore: Math.floor(Math.random() * 10000),
    feedbackPercentage: generateSellerRating(),
    condition: itemSpecifics['Condition'] || 'Used - Very Good',
    shipping: Math.random() > 0.3 ? 'Free Shipping' : `$${(Math.random() * 10).toFixed(2)} Shipping`,
    returnPolicy: Math.random() > 0.5 ? '30 Days Return' : '14 Days Return',
    paymentMethods: 'PayPal, Credit Cards',
    itemSpecifics,
    description: `This is a ${listing.title}. Great product with excellent condition.`,
    listingType: {
      isAuction,
      bidsCount,
      bidderCount,
      hasBuyItNow: isAuction ? Math.random() > 0.3 : false,
      endTime: isAuction 
        ? new Date(Date.now() + (listing.timeRemaining 
            ? parseTimeRemainingToMs(listing.timeRemaining) 
            : Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString()
        : null
    },
    location: 'United States',
    quantityAvailable,
    watchers,
    isAuction, // Also add at the top level for easier access
    timeRemaining: listing.timeRemaining || (isAuction ? generateTimeRemaining() : null),
    bids: bidsCount
  };
}

// Helper function to generate random time remaining
function generateTimeRemaining(): string {
  const days = Math.floor(Math.random() * 7);
  const hours = Math.floor(Math.random() * 24);
  const minutes = Math.floor(Math.random() * 60);
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

// Helper function to parse time remaining string to milliseconds
function parseTimeRemainingToMs(timeString: string): number {
  let totalMs = 0;
  
  const daysMatch = timeString.match(/(\d+)d/);
  if (daysMatch) {
    totalMs += parseInt(daysMatch[1]) * 24 * 60 * 60 * 1000;
  }
  
  const hoursMatch = timeString.match(/(\d+)h/);
  if (hoursMatch) {
    totalMs += parseInt(hoursMatch[1]) * 60 * 60 * 1000;
  }
  
  const minutesMatch = timeString.match(/(\d+)m/);
  if (minutesMatch) {
    totalMs += parseInt(minutesMatch[1]) * 60 * 1000;
  }
  
  return totalMs;
}
