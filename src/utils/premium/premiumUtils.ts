/**
 * Utility functions for premium status
 */
import { supabase } from "@/integrations/supabase/client";
import { getBrowserAPI, isExtensionEnvironment } from '../browserUtils';

// Define types for storage data
interface PremiumStorage {
  dealHavenAIPremium?: string;
}

interface VisualScanStorage {
  [key: string]: number;
}

interface PriceCheckStorageKey {
  [key: string]: number;
}

interface UsageResponse {
  success: boolean;
  message?: string;
  count?: number;
}

// Monthly limits for free tier users
const FREE_TIER_PRICE_CHECK_LIMIT = 5; 
const FREE_TIER_VISUAL_SCAN_LIMIT = 1;

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
  if (isExtensionEnvironment()) {
    const result = await browserAPI.storage.local.get('dealHavenAIPremium');
    return (result as PremiumStorage)?.dealHavenAIPremium === 'active';
  } else {
    return localStorage.getItem('dealHavenAIPremium') === 'active';
  }
}

/**
 * Track Visual Scanner usage
 */
export async function trackVisualScannerUsage(): Promise<boolean> {
  try {
    const { data: session } = await supabase.auth.getSession();
    
    // For logged in users, track in Supabase
    if (session?.session?.user?.id) {
      const now = new Date();
      const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
      
      const { count, error: countError } = await supabase
        .from('visual_scanner_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.session.user.id)
        .eq('month_key', monthKey);
        
      if (countError) {
        console.error('Error checking visual scanner usage count:', countError);
        return false;
      }
      
      if (count >= FREE_TIER_VISUAL_SCAN_LIMIT) {
        console.error('Monthly upload limit reached');
        return false;
      }
      
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
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
    const storageKey = `dealHavenAI_visualScans_${monthKey}`;
    
    if (isExtensionEnvironment()) {
      const browserAPI = getBrowserAPI();
      const result = await browserAPI.storage.local.get(storageKey);
      // Simplified type assertion
      const currentValue = (result[storageKey] as number | undefined) ?? 0;
      console.log('trackVisualScannerUsage: Current value:', currentValue);
      
      if (currentValue >= FREE_TIER_VISUAL_SCAN_LIMIT) {
        console.error('Monthly upload limit reached');
        return false;
      }
      
      await browserAPI.storage.local.set({[storageKey]: currentValue + 1});
    } else {
      const current = parseInt(localStorage.getItem(storageKey) || '0', 10);
      
      if (current >= FREE_TIER_VISUAL_SCAN_LIMIT) {
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
 * Track Price Check usage
 */
export async function trackPriceCheckUsage(itemTitle: string, itemPrice: number): Promise<UsageResponse> {
  try {
    const { data: session } = await supabase.auth.getSession();
    
    // For logged in users, track in Supabase
    if (session?.session?.user?.id) {
      const now = new Date();
      const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
      
      const { count, error: countError } = await supabase
        .from('price_check_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.session.user.id)
        .eq('month_key', monthKey);
        
      if (countError) {
        console.error('Error checking price check usage count:', countError);
        return { 
          success: false, 
          message: 'Failed to check usage limits. Please try again.' 
        };
      }
      
      if (count >= FREE_TIER_PRICE_CHECK_LIMIT) {
        console.log('Monthly price check limit reached');
        return { 
          success: false, 
          message: `You've used all ${FREE_TIER_PRICE_CHECK_LIMIT} free price checks this month. Upgrade to premium for unlimited checks.`,
          count: count
        };
      }
      
      const { error } = await supabase
        .from('price_check_logs')
        .insert({
          user_id: session.session.user.id,
          item_title: itemTitle.substring(0, 255),
          item_price: itemPrice,
          month_key: monthKey
        });
        
      if (error) {
        console.error('Error tracking price check usage:', error);
        return { 
          success: false, 
          message: 'Failed to track usage. Please try again.' 
        };
      }
      
      return { 
        success: true,
        count: count + 1
      };
    }
    
    // For development, track in localStorage with monthly limit
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
    const storageKey = `dealHavenAI_priceChecks_${monthKey}`;
    
    if (isExtensionEnvironment()) {
      const browserAPI = getBrowserAPI();
      const result = await browserAPI.storage.local.get(storageKey);
      // Simplified type assertion
      const currentValue = (result[storageKey] as number | undefined) ?? 0;
      console.log('trackPriceCheckUsage: Current value:', currentValue);
      
      if (currentValue >= FREE_TIER_PRICE_CHECK_LIMIT) {
        console.log('Monthly price check limit reached');
        return { 
          success: false, 
          message: `You've used all ${FREE_TIER_PRICE_CHECK_LIMIT} free price checks this month. Upgrade to premium for unlimited checks.`,
          count: currentValue
        };
      }
      
      const value = currentValue + 1;
      await browserAPI.storage.local.set({[storageKey]: value});
      return { 
        success: true,
        count: value
      };
    } else {
      const current = parseInt(localStorage.getItem(storageKey) || '0', 10);
      
      if (current >= FREE_TIER_PRICE_CHECK_LIMIT) {
        console.log('Monthly price check limit reached');
        return { 
          success: false, 
          message: `You've used all ${FREE_TIER_PRICE_CHECK_LIMIT} free price checks this month. Upgrade to premium for unlimited checks.`,
          count: current
        };
      }
      
      localStorage.setItem(storageKey, (current + 1).toString());
      return { 
        success: true,
        count: current + 1
      };
    }
  } catch (error) {
    console.error('Error tracking price check usage:', error);
    return { 
      success: false, 
      message: 'An error occurred while tracking usage.' 
    };
  }
}

/**
 * Check if user has reached price check limit
 */
export async function hasReachedPriceCheckLimit(): Promise<boolean> {
  try {
    const { data: session } = await supabase.auth.getSession();
    
    // For logged in users, check in Supabase
    if (session?.session?.user?.id) {
      const now = new Date();
      const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
      
      const { count, error } = await supabase
        .from('price_check_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.session.user.id)
        .eq('month_key', monthKey);
        
      if (error) {
        console.error('Error checking price check limit:', error);
        return false;
      }
      
      return count >= FREE_TIER_PRICE_CHECK_LIMIT;
    }
    
    // For development without auth
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
    const storageKey = `dealHavenAI_priceChecks_${monthKey}`;
    
    if (isExtensionEnvironment()) {
      const browserAPI = getBrowserAPI();
      const result = await browserAPI.storage.local.get(storageKey);
      const currentValue = (result[storageKey] as number | undefined) ?? 0;
      return currentValue >= FREE_TIER_PRICE_CHECK_LIMIT;
    } else {
      const current = parseInt(localStorage.getItem(storageKey) || '0', 10);
      return current >= FREE_TIER_PRICE_CHECK_LIMIT;
    }
  } catch (error) {
    console.error('Error checking price check limit:', error);
    return false;
  }
}

/**
 * Get monthly visual scanner usage count
 */
export async function getVisualScannerUsageCount(): Promise<number> {
  try {
    const { data: session } = await supabase.auth.getSession();
    
    // For logged in users, get count from Supabase
    if (session?.session?.user?.id) {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      
      const { count, error } = await supabase
        .from('visual_scanner_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.session.user.id)
        .gte('scan_date', firstDayOfMonth);
        
      if (error) {
        console.error('Error getting visual scanner usage count:', error);
        return 0;
      }
      
      return count || 0;
    }
    
    // For development, get count from localStorage
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
    const storageKey = `dealHavenAI_visualScans_${monthKey}`;
    
    if (isExtensionEnvironment()) {
      const browserAPI = getBrowserAPI();
      const result = await browserAPI.storage.local.get(storageKey);
      return (result[storageKey] as number | undefined) ?? 0;
    } else {
      return parseInt(localStorage.getItem(storageKey) || '0', 10);
    }
  } catch (error) {
    console.error('Error getting visual scanner usage count:', error);
    return 0;
  }
}

/**
 * Get monthly price check usage count
 */
export async function getPriceCheckUsageCount(): Promise<number> {
  try {
    const { data: session } = await supabase.auth.getSession();
    
    // For logged in users, get count from Supabase
    if (session?.session?.user?.id) {
      const now = new Date();
      const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
      
      const { count, error } = await supabase
        .from('price_check_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.session.user.id)
        .eq('month_key', monthKey);
        
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
    
    if (isExtensionEnvironment()) {
      const browserAPI = getBrowserAPI();
      const result = await browserAPI.storage.local.get(storageKey);
      return (result[storageKey] as number | undefined) ?? 0;
    } else {
      return parseInt(localStorage.getItem(storageKey) || '0', 10);
    }
  } catch (error) {
    console.error('Error getting price check usage count:', error);
    return 0;
  }
}