
/**
 * Utility functions for premium status
 */
import { supabase } from "@/integrations/supabase/client";
import { getBrowserAPI } from '../browserUtils';

// Define types for storage data
interface PremiumStorage {
  dealHavenAIPremium?: string;
}

interface VisualScanStorage {
  [key: string]: number;
}

// Constants
const FREE_MONTHLY_PRICE_CHECK_LIMIT = 5;

/**
 * Check premium status
 */
export async function checkPremiumStatus(): Promise<boolean> {
  const browserAPI = getBrowserAPI();
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
    // Fixed: Remove type arguments from storage.get call
    const result = await browserAPI.storage.get('dealHavenAIPremium');
    return (result as PremiumStorage)?.dealHavenAIPremium === 'active';
  } else {
    // For development without browser API
    return localStorage.getItem('dealHavenAIPremium') === 'active';
  }
}

/**
 * Track Visual Scanner usage
 */
export async function trackVisualScannerUsage(): Promise<boolean> {
  const browserAPI = getBrowserAPI();
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
      // Fixed: Remove type arguments from storage.get call
      const result = await browserAPI.storage.get(storageKey);
      const currentValue = (result as unknown as number) || 0;
      
      // Check if monthly limit reached
      if (currentValue >= 1) {
        console.error('Monthly upload limit reached');
        return false;
      }
      
      // Increment usage count
      const value = currentValue + 1;
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

/**
 * Get monthly visual scanner usage count
 */
export async function getVisualScannerUsageCount(): Promise<number> {
  const browserAPI = getBrowserAPI();
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
      // Fixed: Remove type arguments from storage.get call
      const result = await browserAPI.storage.get(storageKey);
      return (result as unknown as number) || 0;
    } else {
      return parseInt(localStorage.getItem(storageKey) || '0', 10);
    }
  } catch (error) {
    console.error('Error getting visual scanner usage count:', error);
    return 0;
  }
}

/**
 * Track Price Check usage
 */
export async function trackPriceCheckUsage(): Promise<boolean> {
  const browserAPI = getBrowserAPI();
  try {
    const { data: session } = await supabase.auth.getSession();
    
    // For logged in users, track in Supabase
    if (session?.session?.user?.id) {
      // Get the current month key in format YYYY-M (e.g., 2025-5)
      const now = new Date();
      const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
      
      // Check if the user has already reached the monthly limit
      const { count, error: countError } = await supabase
        .from('price_check_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.session.user.id)
        .eq('month_key', monthKey);
        
      if (countError) {
        console.error('Error checking price check usage count:', countError);
        return false;
      }
      
      // If user has already used their monthly limit, return false
      if (count >= FREE_MONTHLY_PRICE_CHECK_LIMIT) {
        console.error('Monthly price check limit reached');
        return false;
      }
      
      // Increment usage count
      const { error } = await supabase
        .from('price_check_logs')
        .insert({
          user_id: session.session.user.id,
          check_date: now.toISOString(),
          month_key: monthKey
        });
        
      if (error) {
        console.error('Error tracking price check usage:', error);
        return false;
      }
      
      return true;
    }
    
    // For development, track in localStorage with monthly limit
    // Extract year and month for the month_key
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
    const storageKey = `dealHavenAI_priceChecks_${monthKey}`;
    
    if (browserAPI.isExtensionEnvironment()) {
      // Get current monthly usage count
      const result = await browserAPI.storage.get(storageKey);
      const currentValue = (result as unknown as number) || 0;
      
      // Check if monthly limit reached
      if (currentValue >= FREE_MONTHLY_PRICE_CHECK_LIMIT) {
        console.error('Monthly price check limit reached');
        return false;
      }
      
      // Increment usage count
      const value = currentValue + 1;
      await browserAPI.storage.set({[storageKey]: value});
    } else {
      // For development without browser API, use localStorage with monthly limit
      const current = parseInt(localStorage.getItem(storageKey) || '0', 10);
      
      // Check if monthly limit reached
      if (current >= FREE_MONTHLY_PRICE_CHECK_LIMIT) {
        console.error('Monthly price check limit reached');
        return false;
      }
      
      localStorage.setItem(storageKey, (current + 1).toString());
    }
    
    return true;
  } catch (error) {
    console.error('Error tracking price check usage:', error);
    return false;
  }
}

/**
 * Get current price check usage count
 */
export async function getPriceCheckUsageCount(): Promise<number> {
  const browserAPI = getBrowserAPI();
  try {
    const { data: session } = await supabase.auth.getSession();
    
    // For logged in users, get count from Supabase
    if (session?.session?.user?.id) {
      // Get the current month key in format YYYY-M (e.g., 2025-5)
      const now = new Date();
      const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
      
      const { count, error } = await (supabase
        .from('price_check_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.session.user.id)
        .eq('month_key', monthKey) as any);
        
      if (error) {
        console.error('Error getting price check usage count:', error);
        return 0;
      }
      
      return count || 0;
    }
    
    // For development, get count from localStorage
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
    const storageKey = `dealHavenAI_priceChecks_${monthKey}`;
    
    if (browserAPI.isExtensionEnvironment()) {
      const result = await browserAPI.storage.get(storageKey);
      return (result as unknown as number) || 0;
    } else {
      return parseInt(localStorage.getItem(storageKey) || '0', 10);
    }
  } catch (error) {
    console.error('Error getting price check usage count:', error);
    return 0;
  }
}

/**
 * Check if user has reached free tier price check limit
 */
export async function hasReachedPriceCheckLimit(): Promise<boolean> {
  // Premium users have unlimited checks
  if (await checkPremiumStatus()) {
    return false;
  }
  
  const count = await getPriceCheckUsageCount();
  return count >= FREE_MONTHLY_PRICE_CHECK_LIMIT;
}
