
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuctionMonitorRequest, AuctionMonitorData } from '@/utils/marketplaceAdapters';
import { 
  createAuctionMonitor, 
  getUserAuctionMonitors, 
  updateAuctionMonitor, 
  cancelAuctionMonitor, 
  deleteAuctionMonitor 
} from '@/services/auctionMonitorService';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export function useAuctionMonitors() {
  const queryClient = useQueryClient();
  const { user, isPremium } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingComparables, setIsLoadingComparables] = useState(false);

  // Fetch all monitors for the current user
  const { 
    data: monitors = [],
    isLoading: isLoadingMonitors,
    error: monitorsError,
    refetch: refetchMonitors
  } = useQuery({
    queryKey: ['auctionMonitors', user?.id],
    queryFn: async () => {
      const result = await getUserAuctionMonitors();
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: !!user && isPremium
  });

  // Create a new auction monitor
  const createMonitorMutation = useMutation({
    mutationFn: async (monitorRequest: AuctionMonitorRequest) => {
      const result = await createAuctionMonitor(monitorRequest);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auctionMonitors', user?.id] });
      toast.success('Auction monitor created successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create monitor: ${error.message}`);
    }
  });

  // Update an existing auction monitor
  const updateMonitorMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<AuctionMonitorRequest> }) => {
      const result = await updateAuctionMonitor(id, updates);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auctionMonitors', user?.id] });
      toast.success('Monitor updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update monitor: ${error.message}`);
    }
  });

  // Cancel a monitor
  const cancelMonitorMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await cancelAuctionMonitor(id);
      if (result.error) throw result.error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auctionMonitors', user?.id] });
      toast.success('Monitor cancelled successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel monitor: ${error.message}`);
    }
  });

  // Delete a monitor
  const deleteMonitorMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteAuctionMonitor(id);
      if (result.error) throw result.error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auctionMonitors', user?.id] });
      toast.success('Monitor deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete monitor: ${error.message}`);
    }
  });

  // Find comparable items for market analysis
  const findComparableItems = async (itemId: string, title: string, category?: string) => {
    try {
      setIsLoadingComparables(true);
      // In a real implementation, this would call an API endpoint
      // For now we'll return mock data
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
      
      setIsLoadingComparables(false);
      return {
        marketRate: 95.50,
        itemCount: 12,
        priceRange: { min: 75.00, max: 135.00 },
        dateRange: 'Last 30 days',
        items: [
          { title: 'Similar item 1', price: 92.00, condition: 'Used - Like New', dateSold: '2 days ago' },
          { title: 'Similar item 2', price: 103.50, condition: 'Used - Good', dateSold: '1 week ago' },
          { title: 'Similar item 3', price: 88.75, condition: 'Used - Acceptable', dateSold: 'Yesterday' }
        ]
      };
    } catch (error) {
      setIsLoadingComparables(false);
      console.error('Error finding comparable items:', error);
      return null;
    }
  };

  // Calculate remaining time for auctions
  const calculateTimeRemaining = (endTime: Date): { days: number; hours: number; minutes: number; seconds: number } => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds };
  };

  return {
    monitors,
    isLoadingMonitors,
    monitorsError,
    refetchMonitors,
    createMonitor: createMonitorMutation.mutate,
    isCreatingMonitor: createMonitorMutation.isPending,
    updateMonitor: updateMonitorMutation.mutate,
    isUpdatingMonitor: updateMonitorMutation.isPending,
    cancelMonitor: cancelMonitorMutation.mutate,
    isCancellingMonitor: cancelMonitorMutation.isPending,
    deleteMonitor: deleteMonitorMutation.mutate,
    isDeletingMonitor: deleteMonitorMutation.isPending,
    findComparableItems,
    isLoadingComparables,
    calculateTimeRemaining
  };
}
