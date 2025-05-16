
import { supabase } from '@/integrations/supabase/client';
import { AuctionMonitorRequest, AuctionMonitorData } from '@/utils/marketplaceAdapters';
import { useAuth } from '@/context/AuthContext';

// Create a new auction monitor
export async function createAuctionMonitor(monitorRequest: AuctionMonitorRequest): Promise<{ data: AuctionMonitorData | null; error: Error | null }> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('auction_monitors')
      .insert({
        user_id: session.session.user.id,
        marketplace: monitorRequest.marketplace,
        item_id: monitorRequest.itemId,
        item_url: monitorRequest.itemUrl,
        item_title: monitorRequest.itemTitle,
        current_price: monitorRequest.currentPrice,
        target_price: monitorRequest.targetPrice,
        notification_time: monitorRequest.notificationTime,
        auction_end_time: monitorRequest.auctionEndTime.toISOString(),
        marketplace_metadata: monitorRequest.marketplaceMetadata || {}
      })
      .select('*')
      .single();

    if (error) throw error;

    return { 
      data: formatAuctionMonitorData(data), 
      error: null 
    };
  } catch (error) {
    console.error('Error creating auction monitor:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error creating auction monitor') 
    };
  }
}

// Get all auction monitors for the current user
export async function getUserAuctionMonitors(): Promise<{ data: AuctionMonitorData[]; error: Error | null }> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      return { data: [], error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('auction_monitors')
      .select('*')
      .eq('user_id', session.session.user.id)
      .order('auction_end_time', { ascending: true });

    if (error) throw error;

    return { 
      data: data.map(formatAuctionMonitorData), 
      error: null 
    };
  } catch (error) {
    console.error('Error fetching user auction monitors:', error);
    return { 
      data: [], 
      error: error instanceof Error ? error : new Error('Unknown error fetching auction monitors') 
    };
  }
}

// Update an auction monitor
export async function updateAuctionMonitor(id: string, updates: Partial<AuctionMonitorRequest>): Promise<{ data: AuctionMonitorData | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('auction_monitors')
      .update({
        target_price: updates.targetPrice,
        notification_time: updates.notificationTime,
        marketplace_metadata: updates.marketplaceMetadata
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    return { 
      data: formatAuctionMonitorData(data), 
      error: null 
    };
  } catch (error) {
    console.error('Error updating auction monitor:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error updating auction monitor') 
    };
  }
}

// Cancel an auction monitor
export async function cancelAuctionMonitor(id: string): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase
      .from('auction_monitors')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error cancelling auction monitor:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error cancelling auction monitor') 
    };
  }
}

// Delete an auction monitor
export async function deleteAuctionMonitor(id: string): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase
      .from('auction_monitors')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting auction monitor:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error deleting auction monitor') 
    };
  }
}

// Format the data from Supabase to match our AuctionMonitorData interface
function formatAuctionMonitorData(data: any): AuctionMonitorData {
  return {
    id: data.id,
    userId: data.user_id,
    itemId: data.item_id,
    itemUrl: data.item_url,
    itemTitle: data.item_title,
    currentPrice: data.current_price,
    targetPrice: data.target_price,
    notificationTime: data.notification_time,
    status: data.status,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    auctionEndTime: new Date(data.auction_end_time),
    marketplace: data.marketplace,
    marketplaceMetadata: data.marketplace_metadata,
    marketRate: data.market_rate
  };
}

// Custom hook for using auction monitors
export function useAuctionMonitors() {
  const { user } = useAuth();
  
  const getMonitors = async () => {
    if (!user) return { data: [], error: new Error('User not authenticated') };
    return await getUserAuctionMonitors();
  };
  
  return {
    getMonitors,
    createAuctionMonitor,
    updateAuctionMonitor,
    cancelAuctionMonitor,
    deleteAuctionMonitor
  };
}
