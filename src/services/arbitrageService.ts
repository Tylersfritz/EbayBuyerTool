
import { supabase } from '@/integrations/supabase/client';
import { ArbitrageOpportunity, ArbitrageSearchParams } from '@/utils/marketplaceAdapters/types';
import { toast } from '@/components/ui/sonner';

// Search for arbitrage opportunities
export async function searchArbitrageOpportunities(
  params: ArbitrageSearchParams
): Promise<{ data: ArbitrageOpportunity[] | null; error: Error | null }> {
  try {
    console.log('Searching for arbitrage opportunities:', params);
    
    // Normally we would call an API to search across marketplaces
    // For testing purposes, we're generating mock results
    
    // Simulating a delay for the API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock data generator for testing UI
    const mockOpportunities: ArbitrageOpportunity[] = [];
    const count = Math.floor(Math.random() * 5) + 3; // 3-7 results
    
    for (let i = 0; i < count; i++) {
      const sourcePrice = Math.floor(Math.random() * 200) + 50; // $50-$250
      const targetPrice = Math.floor(sourcePrice * (1.3 + Math.random() * 0.7)); // 30-100% higher
      const priceDifference = targetPrice - sourcePrice;
      const profitMargin = (priceDifference / sourcePrice) * 100;
      
      mockOpportunities.push({
        sourceMarketplace: params.sourceMarketplace,
        targetMarketplace: params.targetMarketplace,
        sourceItemId: `src-item-${i}`,
        sourceItemUrl: `https://www.${params.sourceMarketplace}.com/item/${i}`,
        sourceItemTitle: `${params.query} - ${i} (${params.sourceMarketplace})`,
        sourcePrice: sourcePrice,
        targetPrice: targetPrice,
        priceDifference: priceDifference,
        profitMargin: Math.round(profitMargin * 10) / 10,
        status: 'active',
        sourceListingData: { condition: 'New' },
        targetListingData: { condition: 'New' }
      });
    }
    
    console.log('Found mock arbitrage opportunities:', mockOpportunities);
    return { data: mockOpportunities, error: null };
  } catch (error: any) {
    console.error('Error searching for arbitrage opportunities:', error.message);
    return { data: null, error: error as Error };
  }
}

// Save an arbitrage opportunity to the user's account
export async function saveArbitrageOpportunity(
  opportunity: ArbitrageOpportunity
): Promise<{ data: ArbitrageOpportunity | null; error: Error | null }> {
  try {
    console.log('Saving arbitrage opportunity:', opportunity);
    
    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('arbitrage_opportunities')
      .insert({
        user_id: user.id,
        source_marketplace: opportunity.sourceMarketplace,
        source_item_id: opportunity.sourceItemId,
        source_item_url: opportunity.sourceItemUrl,
        source_item_title: opportunity.sourceItemTitle,
        source_price: opportunity.sourcePrice,
        target_marketplace: opportunity.targetMarketplace,
        target_price: opportunity.targetPrice,
        price_difference: opportunity.priceDifference,
        profit_margin: opportunity.profitMargin,
        status: opportunity.status || 'active',
        source_listing_data: opportunity.sourceListingData || {},
        target_listing_data: opportunity.targetListingData || {}
      })
      .select('*')
      .single();
    
    if (error) throw error;
    
    // Convert the snake_case database fields to camelCase for our frontend
    const savedOpportunity: ArbitrageOpportunity = {
      id: data.id,
      userId: data.user_id,
      sourceMarketplace: data.source_marketplace,
      sourceItemId: data.source_item_id,
      sourceItemUrl: data.source_item_url,
      sourceItemTitle: data.source_item_title,
      sourcePrice: data.source_price,
      targetMarketplace: data.target_marketplace,
      targetPrice: data.target_price,
      priceDifference: data.price_difference,
      profitMargin: data.profit_margin,
      status: data.status as 'active' | 'sold' | 'expired' | 'hidden',
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      sourceListingData: data.source_listing_data,
      targetListingData: data.target_listing_data
    };
    
    console.log('Saved arbitrage opportunity:', savedOpportunity);
    return { data: savedOpportunity, error: null };
  } catch (error: any) {
    console.error('Error saving arbitrage opportunity:', error.message);
    return { data: null, error: error as Error };
  }
}

// Get all arbitrage opportunities for the current user
export async function getUserArbitrageOpportunities(): Promise<{ data: ArbitrageOpportunity[] | null; error: Error | null }> {
  try {
    console.log('Fetching user arbitrage opportunities');
    
    const { data, error } = await supabase
      .from('arbitrage_opportunities')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Convert the snake_case database fields to camelCase for our frontend
    const opportunities: ArbitrageOpportunity[] = data.map(item => ({
      id: item.id,
      userId: item.user_id,
      sourceMarketplace: item.source_marketplace,
      sourceItemId: item.source_item_id,
      sourceItemUrl: item.source_item_url,
      sourceItemTitle: item.source_item_title,
      sourcePrice: item.source_price,
      targetMarketplace: item.target_marketplace,
      targetPrice: item.target_price,
      priceDifference: item.price_difference,
      profitMargin: item.profit_margin,
      status: item.status as 'active' | 'sold' | 'expired' | 'hidden',
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      sourceListingData: item.source_listing_data,
      targetListingData: item.target_listing_data
    }));
    
    console.log('Fetched user arbitrage opportunities:', opportunities);
    return { data: opportunities, error: null };
  } catch (error: any) {
    console.error('Error fetching user arbitrage opportunities:', error.message);
    return { data: null, error: error as Error };
  }
}

// Update the status of an arbitrage opportunity
export async function updateArbitrageOpportunityStatus(
  id: string, 
  status: 'active' | 'sold' | 'expired' | 'hidden'
): Promise<{ success: boolean; error: Error | null }> {
  try {
    console.log(`Updating arbitrage opportunity ${id} status to ${status}`);
    
    const { error } = await supabase
      .from('arbitrage_opportunities')
      .update({ status })
      .eq('id', id);
    
    if (error) throw error;
    
    console.log(`Successfully updated arbitrage opportunity ${id} status`);
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error updating arbitrage opportunity status:', error.message);
    return { success: false, error: error as Error };
  }
}

// Delete an arbitrage opportunity
export async function deleteArbitrageOpportunity(
  id: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    console.log(`Deleting arbitrage opportunity ${id}`);
    
    const { error } = await supabase
      .from('arbitrage_opportunities')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    console.log(`Successfully deleted arbitrage opportunity ${id}`);
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error deleting arbitrage opportunity:', error.message);
    return { success: false, error: error as Error };
  }
}
