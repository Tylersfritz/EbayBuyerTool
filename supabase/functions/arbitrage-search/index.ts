
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Set up the Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Mock data for development - would be replaced by actual API calls to marketplaces
const generateMockResults = (query: string, sourceMarketplace: string, targetMarketplace: string, minProfitMargin: number) => {
  const results = [];
  const count = Math.floor(Math.random() * 5) + 3; // 3-7 results
  
  for (let i = 0; i < count; i++) {
    const sourcePrice = Math.floor(Math.random() * 200) + 50; // $50-$250
    const targetPrice = Math.floor(sourcePrice * (1.3 + Math.random() * 0.7)); // 30-100% higher
    const priceDifference = targetPrice - sourcePrice;
    const profitMargin = (priceDifference / sourcePrice) * 100;
    
    // Only include results that meet the minimum profit margin
    if (profitMargin >= minProfitMargin) {
      results.push({
        sourceMarketplace,
        targetMarketplace,
        sourceItemId: `src-item-${i}`,
        sourceItemUrl: `https://www.${sourceMarketplace}.com/item/${i}`,
        sourceItemTitle: `${query} - ${i} (${sourceMarketplace})`,
        sourcePrice,
        targetPrice,
        priceDifference,
        profitMargin: Math.round(profitMargin * 10) / 10,
        status: 'active',
        sourceListingData: { condition: 'New' },
        targetListingData: { condition: 'New' }
      });
    }
  }
  
  return results;
};

// Handle requests
serve(async (req) => {
  console.log(`Received ${req.method} request to ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Only handle POST requests for search
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }
    
    // Verify JWT and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized: Invalid token');
    }
    
    // Check if user has premium access
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (subError) {
      throw new Error('Error fetching subscription details');
    }
    
    const isPremium = subscription.subscription_status === 'active' && 
                     subscription.subscription_tier === 'premium';
    
    if (!isPremium) {
      return new Response(JSON.stringify({ error: 'Premium subscription required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Parse search parameters
    const searchParams = await req.json();
    const { 
      sourceMarketplace, 
      targetMarketplace, 
      query, 
      minProfitMargin = 20,
      maxPrice = 500,
      includeUsed = true,
      includeFees = true
    } = searchParams;
    
    console.log('Search params:', searchParams);
    
    if (!sourceMarketplace || !targetMarketplace || !query) {
      throw new Error('Missing required search parameters');
    }
    
    // In a real implementation, we would now:
    // 1. Call the source marketplace API to search for items
    // 2. For each item found, search the target marketplace for similar items
    // 3. Calculate potential profit after fees
    // 4. Return the results
    
    // For now, we'll use mock data
    const results = generateMockResults(query, sourceMarketplace, targetMarketplace, minProfitMargin);
    
    console.log(`Found ${results.length} potential arbitrage opportunities`);
    
    // Return the results
    return new Response(JSON.stringify({ data: results }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error processing arbitrage search:', error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
