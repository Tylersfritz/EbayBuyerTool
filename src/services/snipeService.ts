
import { supabase } from '@/integrations/supabase/client';
import { SnipeRequest, SnipeData } from '@/utils/marketplaceAdapters';
import { useAuth } from '@/context/AuthContext';

// Create a new snipe
export async function createSnipe(snipeRequest: SnipeRequest): Promise<{ data: SnipeData | null; error: Error | null }> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('auction_snipes')
      .insert({
        user_id: session.session.user.id,
        marketplace: snipeRequest.marketplace,
        item_id: snipeRequest.itemId,
        item_url: snipeRequest.itemUrl,
        item_title: snipeRequest.itemTitle,
        current_price: snipeRequest.currentPrice,
        max_bid_amount: snipeRequest.maxBidAmount,
        snipe_time: snipeRequest.snipeTime,
        auction_end_time: snipeRequest.auctionEndTime.toISOString(),
        marketplace_metadata: snipeRequest.marketplaceMetadata || {}
      })
      .select('*')
      .single();

    if (error) throw error;

    return { 
      data: formatSnipeData(data), 
      error: null 
    };
  } catch (error) {
    console.error('Error creating snipe:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error creating snipe') 
    };
  }
}

// Get all snipes for the current user
export async function getUserSnipes(): Promise<{ data: SnipeData[]; error: Error | null }> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      return { data: [], error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('auction_snipes')
      .select('*')
      .eq('user_id', session.session.user.id)
      .order('auction_end_time', { ascending: true });

    if (error) throw error;

    return { 
      data: data.map(formatSnipeData), 
      error: null 
    };
  } catch (error) {
    console.error('Error fetching user snipes:', error);
    return { 
      data: [], 
      error: error instanceof Error ? error : new Error('Unknown error fetching snipes') 
    };
  }
}

// Update a snipe
export async function updateSnipe(id: string, updates: Partial<SnipeRequest>): Promise<{ data: SnipeData | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('auction_snipes')
      .update({
        max_bid_amount: updates.maxBidAmount,
        snipe_time: updates.snipeTime,
        marketplace_metadata: updates.marketplaceMetadata
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    return { 
      data: formatSnipeData(data), 
      error: null 
    };
  } catch (error) {
    console.error('Error updating snipe:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error updating snipe') 
    };
  }
}

// Cancel a snipe
export async function cancelSnipe(id: string): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase
      .from('auction_snipes')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error cancelling snipe:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error cancelling snipe') 
    };
  }
}

// Delete a snipe
export async function deleteSnipe(id: string): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase
      .from('auction_snipes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting snipe:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error deleting snipe') 
    };
  }
}

// Format the data from Supabase to match our SnipeData interface
function formatSnipeData(data: any): SnipeData {
  return {
    id: data.id,
    userId: data.user_id,
    itemId: data.item_id,
    itemUrl: data.item_url,
    itemTitle: data.item_title,
    currentPrice: data.current_price,
    maxBidAmount: data.max_bid_amount,
    snipeTime: data.snipe_time,
    status: data.status,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    auctionEndTime: new Date(data.auction_end_time),
    marketplace: data.marketplace,
    marketplaceMetadata: data.marketplace_metadata
  };
}

// Custom hook for using snipes
export function useSnipes() {
  const { user } = useAuth();
  
  const getSnipes = async () => {
    if (!user) return { data: [], error: new Error('User not authenticated') };
    return await getUserSnipes();
  };
  
  return {
    getSnipes,
    createSnipe,
    updateSnipe,
    cancelSnipe,
    deleteSnipe
  };
}
