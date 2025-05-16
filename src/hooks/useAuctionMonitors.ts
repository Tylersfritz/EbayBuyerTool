
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuctionMonitorData, AuctionMonitorRequest } from '@/utils/marketplaceAdapters';
import { createAuctionMonitor, getUserAuctionMonitors, updateAuctionMonitor, cancelAuctionMonitor, deleteAuctionMonitor } from '@/services/auctionMonitorService';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/context/AuthContext';

export function useAuctionMonitors() {
  const queryClient = useQueryClient();
  const { user, isPremium } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all auction monitors for the current user
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
    mutationFn: async (newMonitor: AuctionMonitorRequest) => {
      const result = await createAuctionMonitor(newMonitor);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auctionMonitors', user?.id] });
      toast.success('Auction monitor setup successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to set up auction monitor: ${error.message}`);
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
      toast.success('Auction monitor updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update auction monitor: ${error.message}`);
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
      toast.success('Auction monitor cancelled successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel auction monitor: ${error.message}`);
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
      toast.success('Auction monitor deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete auction monitor: ${error.message}`);
    }
  });

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

  // Function to find comparable items using Market Insights API
  const findComparableItems = async (itemId: string, title: string, category: string | undefined) => {
    setIsLoading(true);
    try {
      // This is a placeholder for the actual API call to the Market Insights API
      // In a real implementation, we would call the API to fetch comparable items
      const apiUrl = `/api/price-check?itemId=${itemId}&itemName=${encodeURIComponent(title)}`;
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch comparable items');
      }
      
      const data = await response.json();
      setIsLoading(false);
      return data;
    } catch (error) {
      setIsLoading(false);
      toast.error('Failed to find comparable items');
      console.error('Error finding comparable items:', error);
      return null;
    }
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
    calculateTimeRemaining,
    findComparableItems,
    isLoadingComparables: isLoading
  };
}
