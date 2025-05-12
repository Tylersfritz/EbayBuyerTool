
import { MarketplaceAdapter, ArbitrageSearchParams } from './types';
import { ebayAdapter } from './ebayAdapter';
import { mercariAdapter } from './mercariAdapter';

// Registry of all supported marketplace adapters
const marketplaceAdapters: Record<string, MarketplaceAdapter> = {
  ebay: ebayAdapter,
  mercari: mercariAdapter,
};

export function getAdapterForMarketplace(marketplaceName: string): MarketplaceAdapter | null {
  return marketplaceAdapters[marketplaceName.toLowerCase()] || null;
}

export function getAdapterForUrl(url: string): MarketplaceAdapter | null {
  for (const adapter of Object.values(marketplaceAdapters)) {
    if (adapter.detectListing(url)) {
      return adapter;
    }
  }
  return null;
}

export function getSupportedMarketplaces(): MarketplaceAdapter[] {
  return Object.values(marketplaceAdapters);
}

export function getArbitrageTargets(sourceMarketplace: string): string[] {
  const adapter = getAdapterForMarketplace(sourceMarketplace);
  return adapter?.supportedArbitrageTargets || [];
}

export function getSearchUrl(marketplace: string, query: string): string | null {
  const adapter = getAdapterForMarketplace(marketplace);
  if (adapter?.searchUrl) {
    return adapter.searchUrl(query);
  }
  return null;
}

export * from './types';
export { ebayAdapter, mercariAdapter };
