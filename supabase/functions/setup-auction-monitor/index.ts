
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AuctionMonitorRequest {
  itemId: string;
  itemUrl: string;
  targetPrice: number;
  notificationTime: number;
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
    const { itemId, itemUrl, targetPrice, notificationTime, marketplace, auctionEndTime } = await req.json() as AuctionMonitorRequest
    
    // Check for missing parameters
    if (!itemId || !targetPrice || !notificationTime || !marketplace || !auctionEndTime) {
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

    // Calculate when the notification should be sent
    const notificationTime = new Date(endTime.getTime() - (notificationTime * 1000))
    
    // Update the monitor status to 'active'
    const { data: updatedMonitor, error: updateError } = await supabaseClient
      .from('auction_monitors')
      .update({
        status: 'active',
      })
      .eq('item_id', itemId)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (updateError) {
      console.error('Error updating auction monitor status:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update auction monitor status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Here in a production system, we would schedule the notification
    // This could be done with a custom scheduler or a third-party service
    // For this example, we'll just return a success message
    
    return new Response(
      JSON.stringify({
        message: 'Auction monitor set up successfully',
        data: {
          monitorId: updatedMonitor.id,
          userId: user.id,
          itemId,
          marketplace,
          notificationTime: notificationTime.toISOString()
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing auction monitor request:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
