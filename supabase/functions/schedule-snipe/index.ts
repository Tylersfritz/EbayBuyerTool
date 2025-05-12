
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SnipeRequest {
  itemId: string;
  itemUrl: string;
  maxBidAmount: number;
  snipeTime: number;
  marketplace: string;
  auctionEndTime: string;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || ''
    )

    // Get auth user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get JWT from auth header
    const token = authHeader.replace('Bearer ', '')
    
    // Verify the JWT and get the user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token or user not found' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse the request body
    const { itemId, itemUrl, maxBidAmount, snipeTime, marketplace, auctionEndTime } = await req.json() as SnipeRequest
    
    // Check for missing parameters
    if (!itemId || !maxBidAmount || !snipeTime || !marketplace || !auctionEndTime) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate auction end time
    const endTime = new Date(auctionEndTime)
    if (isNaN(endTime.getTime())) {
      return new Response(
        JSON.stringify({ error: 'Invalid auction end time' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if end time is in the future
    const now = new Date()
    if (endTime <= now) {
      return new Response(
        JSON.stringify({ error: 'Auction has already ended' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate when the snipe should be executed
    const snipeExecutionTime = new Date(endTime.getTime() - (snipeTime * 1000))
    
    // Update the snipe status to 'scheduled'
    const { data: updatedSnipe, error: updateError } = await supabaseClient
      .from('auction_snipes')
      .update({
        status: 'scheduled',
      })
      .eq('item_id', itemId)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (updateError) {
      console.error('Error updating snipe status:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update snipe status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Here in a production system, we would schedule the execution of the snipe
    // This could be done with a custom scheduler or a third-party service
    // For this example, we'll just return a success message
    
    return new Response(
      JSON.stringify({
        message: 'Snipe scheduled successfully',
        data: {
          snipeId: updatedSnipe.id,
          userId: user.id,
          itemId,
          marketplace,
          snipeExecutionTime: snipeExecutionTime.toISOString()
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing snipe request:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
