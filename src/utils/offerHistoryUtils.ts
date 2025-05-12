
import { saveToStorage, getFromStorage } from './extensionUtils';

export interface OfferHistoryItem {
  id: string;
  timestamp: string;
  itemTitle: string;
  itemPrice: number;
  marketPrice: number | null;
  offerPrice: number;
  offerType: 'lowball' | 'fair' | 'sweetspot' | 'basic';
  tone?: 'friendly' | 'firm' | 'curious';
  message: string;
  seller?: string;
  success?: boolean;
  responseReceived?: boolean;
  isAuction?: boolean; // Track if this was an auction listing
  bidPercentToMarket?: number; // For auctions: the bid as percentage of market value
}

const HISTORY_STORAGE_KEY = 'offerHistory';
const MAX_HISTORY_ITEMS = 30;

/**
 * Save a new offer to history
 */
export async function saveOfferToHistory(offer: Omit<OfferHistoryItem, 'id' | 'timestamp'>): Promise<OfferHistoryItem> {
  const newOffer: OfferHistoryItem = {
    ...offer,
    id: Date.now().toString(),
    timestamp: new Date().toISOString()
  };
  
  // Get current history
  const currentHistory = await getOfferHistory();
  
  // Add new offer to the start of the array
  const updatedHistory = [newOffer, ...currentHistory].slice(0, MAX_HISTORY_ITEMS);
  
  // Save updated history
  await saveToStorage(HISTORY_STORAGE_KEY, updatedHistory);
  
  return newOffer;
}

/**
 * Get all offer history
 */
export async function getOfferHistory(): Promise<OfferHistoryItem[]> {
  const history = await getFromStorage<OfferHistoryItem[]>(HISTORY_STORAGE_KEY);
  return history || [];
}

/**
 * Update an existing offer in history
 */
export async function updateOfferHistory(offerId: string, updates: Partial<OfferHistoryItem>): Promise<boolean> {
  const history = await getOfferHistory();
  const offerIndex = history.findIndex(item => item.id === offerId);
  
  if (offerIndex === -1) return false;
  
  // Update the offer
  history[offerIndex] = {
    ...history[offerIndex],
    ...updates
  };
  
  // Save updated history
  await saveToStorage(HISTORY_STORAGE_KEY, history);
  
  return true;
}

/**
 * Delete an offer from history
 */
export async function deleteFromHistory(offerId: string): Promise<boolean> {
  const history = await getOfferHistory();
  const filteredHistory = history.filter(item => item.id !== offerId);
  
  if (filteredHistory.length === history.length) return false;
  
  // Save updated history
  await saveToStorage(HISTORY_STORAGE_KEY, filteredHistory);
  
  return true;
}

/**
 * Clear all offer history
 */
export async function clearOfferHistory(): Promise<void> {
  await saveToStorage(HISTORY_STORAGE_KEY, []);
}

/**
 * Get statistics about offer history
 */
export async function getOfferStats() {
  const history = await getOfferHistory();
  
  const successfulOffers = history.filter(offer => offer.success).length;
  const totalResponses = history.filter(offer => offer.responseReceived).length;
  const responseRate = history.length > 0 ? (totalResponses / history.length) * 100 : 0;
  const successRate = totalResponses > 0 ? (successfulOffers / totalResponses) * 100 : 0;
  
  // Get stats by offer type
  const offerTypeStats = {
    lowball: {
      count: 0,
      responses: 0,
      successful: 0
    },
    fair: {
      count: 0,
      responses: 0,
      successful: 0
    },
    sweetspot: {
      count: 0,
      responses: 0,
      successful: 0
    },
    basic: {
      count: 0,
      responses: 0,
      successful: 0
    }
  };
  
  // Calculate stats for each offer type
  history.forEach(offer => {
    const type = offer.offerType;
    offerTypeStats[type].count++;
    
    if (offer.responseReceived) {
      offerTypeStats[type].responses++;
    }
    
    if (offer.success) {
      offerTypeStats[type].successful++;
    }
  });
  
  // Get stats for auctions vs fixed-price listings
  const auctionStats = {
    count: history.filter(offer => offer.isAuction).length,
    successful: history.filter(offer => offer.isAuction && offer.success).length,
    responseRate: 0
  };
  
  const fixedPriceStats = {
    count: history.filter(offer => !offer.isAuction).length,
    successful: history.filter(offer => !offer.isAuction && offer.success).length,
    responseRate: 0
  };
  
  // Calculate response rates
  if (auctionStats.count > 0) {
    const auctionResponses = history.filter(offer => offer.isAuction && offer.responseReceived).length;
    auctionStats.responseRate = (auctionResponses / auctionStats.count) * 100;
  }
  
  if (fixedPriceStats.count > 0) {
    const fixedResponses = history.filter(offer => !offer.isAuction && offer.responseReceived).length;
    fixedPriceStats.responseRate = (fixedResponses / fixedPriceStats.count) * 100;
  }
  
  return {
    totalOffers: history.length,
    responseRate,
    successRate,
    offerTypeStats,
    auctionStats,
    fixedPriceStats
  };
}
