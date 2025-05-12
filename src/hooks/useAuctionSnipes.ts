
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SnipeData, SnipeRequest } from '@/utils/marketplaceAdapters';
import { createSnipe, getUserSnipes, updateSnipe, cancelSnipe, deleteSnipe } from '@/services/snipeService';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/context/AuthContext';

export function useAuctionSnipes() {
  const queryClient = useQueryClient();
  const { user, isPremium } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all snipes for the current user
  const { 
    data: snipes = [],
    isLoading: isLoadingSnipes,
    error: snipesError,
    refetch: refetchSnipes
  } = useQuery({
    queryKey: ['snipes', user?.id],
    queryFn: async () => {
      const result = await getUserSnipes();
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: !!user && isPremium
  });

  // Create a new snipe
  const createSnipeMutation = useMutation({
    mutationFn: async (newSnipe: SnipeRequest) => {
      const result = await createSnipe(newSnipe);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snipes', user?.id] });
      toast.success('Auction snipe scheduled successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to schedule snipe: ${error.message}`);
    }
  });

  // Update an existing snipe
  const updateSnipeMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SnipeRequest> }) => {
      const result = await updateSnipe(id, updates);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snipes', user?.id] });
      toast.success('Snipe updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update snipe: ${error.message}`);
    }
  });

  // Cancel a snipe
  const cancelSnipeMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await cancelSnipe(id);
      if (result.error) throw result.error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snipes', user?.id] });
      toast.success('Snipe cancelled successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel snipe: ${error.message}`);
    }
  });

  // Delete a snipe
  const deleteSnipeMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteSnipe(id);
      if (result.error) throw result.error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snipes', user?.id] });
      toast.success('Snipe deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete snipe: ${error.message}`);
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

  return {
    snipes,
    isLoadingSnipes,
    snipesError,
    refetchSnipes,
    createSnipe: createSnipeMutation.mutate,
    isCreatingSnipe: createSnipeMutation.isPending,
    updateSnipe: updateSnipeMutation.mutate,
    isUpdatingSnipe: updateSnipeMutation.isPending,
    cancelSnipe: cancelSnipeMutation.mutate,
    isCancellingSnipe: cancelSnipeMutation.isPending,
    deleteSnipe: deleteSnipeMutation.mutate,
    isDeletingSnipe: deleteSnipeMutation.isPending,
    calculateTimeRemaining
  };
}
