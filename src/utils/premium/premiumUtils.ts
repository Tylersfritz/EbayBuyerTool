
/**
 * Utility functions for premium status
 */
import { supabase } from "@/integrations/supabase/client";
import { browserAPI } from "../browserUtils";

// Check premium status 
export async function checkPremiumStatus(): Promise<boolean> {
  const { data: session } = await supabase.auth.getSession();
  
  // For logged in users, check subscription status in Supabase
  if (session?.session?.user?.id) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session.session.user.id)
        .single();
        
      if (error) {
        console.error('Error checking premium status:', error);
        return false;
      }
      
      return data?.subscription_status === 'active' && data?.subscription_tier === 'premium';
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  }
  
  // For development without auth, fall back to localStorage/browser.storage
  if (browserAPI.isExtensionEnvironment()) {
    const result = await browserAPI.storage.get<Record<string, unknown>>('dealHavenAIPremium');
    return result?.dealHavenAIPremium === 'active';
  } else {
    // For development without browser API
    return localStorage.getItem('dealHavenAIPremium') === 'active';
  }
}

// Track Visual Scanner usage
export async function trackVisualScannerUsage(): Promise<boolean> {
  try {
    const { data: session } = await supabase.auth.getSession();
    
    // For logged in users, track in Supabase
    if (session?.session?.user?.id) {
      // Get the current month key in format YYYY-M (e.g., 2025-5)
      const now = new Date();
      const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
      
      // Check if the user has already reached the monthly limit (1 for free tier)
      const { count, error: countError } = await supabase
        .from('visual_scanner_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.session.user.id)
        .eq('month_key', monthKey);
        
      if (countError) {
        console.error('Error checking visual scanner usage count:', countError);
        return false;
      }
      
      // If user has already used their monthly limit, return false
      if (count >= 1) {
        console.error('Monthly upload limit reached');
        return false;
      }
      
      // We need to cast the table name to any since the types don't 
      // include our newly updated table with month_key yet
      const { error } = await supabase
        .from('visual_scanner_logs')
        .insert({
          user_id: session.session.user.id,
          scan_date: now.toISOString(),
          month_key: monthKey
        });
        
      if (error) {
        console.error('Error tracking visual scanner usage:', error);
        return false;
      }
      
      return true;
    }
    
    // For development, track in localStorage with monthly limit
    // Extract year and month for the month_key
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
    const storageKey = `dealHavenAI_visualScans_${monthKey}`;
    
    if (browserAPI.isExtensionEnvironment()) {
      // Get current monthly usage count
      const result = await browserAPI.storage.get<number>(storageKey) || 0;
      
      // Check if monthly limit reached
      if ((result as number) >= 1) {
        console.error('Monthly upload limit reached');
        return false;
      }
      
      // Increment usage count
      const value = (result as number) + 1;
      await browserAPI.storage.set({[storageKey]: value});
    } else {
      // For development without browser API, use localStorage with monthly limit
      const current = parseInt(localStorage.getItem(storageKey) || '0', 10);
      
      // Check if monthly limit reached
      if (current >= 1) {
        console.error('Monthly upload limit reached');
        return false;
      }
      
      localStorage.setItem(storageKey, (current + 1).toString());
    }
    
    return true;
  } catch (error) {
    console.error('Error tracking visual scanner usage:', error);
    return false;
  }
}

// Get monthly visual scanner usage count
export async function getVisualScannerUsageCount(): Promise<number> {
  try {
    const { data: session } = await supabase.auth.getSession();
    
    // For logged in users, get count from Supabase
    if (session?.session?.user?.id) {
      // Get the first day of current month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      
      // We need to cast the table name to any since the types don't 
      // include our newly created table yet
      const { count, error } = await (supabase
        .from('visual_scanner_logs' as any)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.session.user.id)
        .gte('scan_date', firstDayOfMonth) as any);
        
      if (error) {
        console.error('Error getting visual scanner usage count:', error);
        return 0;
      }
      
      return count || 0;
    }
    
    // For development, get count from localStorage
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const storageKey = `dealHavenAI_visualScans_${today}`;
    
    if (browserAPI.isExtensionEnvironment()) {
      const result = await browserAPI.storage.get<number>(storageKey);
      return result || 0;
    } else {
      return parseInt(localStorage.getItem(storageKey) || '0', 10);
    }
  } catch (error) {
    console.error('Error getting visual scanner usage count:', error);
    return 0;
  }
}
