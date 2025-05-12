
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  searchArbitrageOpportunities, 
  saveArbitrageOpportunity, 
  getUserArbitrageOpportunities,
  updateArbitrageOpportunityStatus,
  deleteArbitrageOpportunity
} from '@/services/arbitrageService';
import { ArbitrageOpportunity, ArbitrageSearchParams } from '@/utils/marketplaceAdapters/types';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/context/AuthContext';

export function useArbitrage() {
  const queryClient = useQueryClient();
  const { user, isPremium } = useAuth();
  const [searchParams, setSearchParams] = useState<ArbitrageSearchParams | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // Fetch saved arbitrage opportunities for the current user
  const { 
    data: savedOpportunities = [],
    isLoading: isLoadingSaved,
    error: savedError,
    refetch: refetchSaved
  } = useQuery({
    queryKey: ['arbitrageOpportunities', user?.id],
    queryFn: async () => {
      const result = await getUserArbitrageOpportunities();
      if (result.error) throw result.error;
      return result.data || [];
    },
    enabled: !!user && isPremium
  });
  
  // Search for arbitrage opportunities
  const search = async (params: ArbitrageSearchParams) => {
    if (!isPremium) {
      toast.error('Arbitrage search is a premium feature. Please upgrade to access it.');
      return null;
    }
    
    try {
      setIsSearching(true);
      setSearchParams(params);
      
      const result = await searchArbitrageOpportunities(params);
      if (result.error) throw result.error;
      
      return result.data || [];
    } catch (error) {
      toast.error(`Search failed: ${(error as Error).message}`);
      return null;
    } finally {
      setIsSearching(false);
    }
  };
  
  // Save an arbitrage opportunity
  const saveMutation = useMutation({
    mutationFn: async (opportunity: ArbitrageOpportunity) => {
      const result = await saveArbitrageOpportunity(opportunity);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arbitrageOpportunities', user?.id] });
      toast.success('Opportunity saved successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save opportunity: ${error.message}`);
    }
  });
  
  // Update the status of an arbitrage opportunity
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'sold' | 'expired' | 'hidden' }) => {
      const result = await updateArbitrageOpportunityStatus(id, status);
      if (result.error) throw result.error;
      return { id, status };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['arbitrageOpportunities', user?.id] });
      toast.success(`Opportunity marked as ${data.status}`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update status: ${error.message}`);
    }
  });
  
  // Delete an arbitrage opportunity
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteArbitrageOpportunity(id);
      if (result.error) throw result.error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arbitrageOpportunities', user?.id] });
      toast.success('Opportunity deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete opportunity: ${error.message}`);
    }
  });
  
  return {
    savedOpportunities,
    isLoadingSaved,
    savedError,
    refetchSaved,
    searchParams,
    isSearching,
    search,
    saveOpportunity: saveMutation.mutate,
    isSaving: saveMutation.isPending,
    updateStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending,
    deleteOpportunity: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending
  };
}
