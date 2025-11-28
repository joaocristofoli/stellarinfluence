import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    console.log('Starting creator stats update...')

    // Fetch all creators
    const { data: creators, error: fetchError } = await supabaseClient
      .from('creators')
      .select('*')

    if (fetchError) {
      throw fetchError
    }

    if (!creators || creators.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No creators found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    const updates = []

    for (const creator of creators) {
      console.log(`Updating stats for ${creator.name}...`)

      // Here you would call the social media APIs to get real follower counts
      // For now, we'll just format the existing data
      
      let totalFollowers = 0
      
      if (creator.instagram_active) {
        totalFollowers += creator.instagram_followers || 0
      }
      if (creator.youtube_active) {
        totalFollowers += creator.youtube_followers || 0
      }
      if (creator.tiktok_active) {
        totalFollowers += creator.tiktok_followers || 0
      }
      if (creator.twitter_active) {
        totalFollowers += creator.twitter_followers || 0
      }

      // Format total followers (e.g., 1.5M, 250K)
      const formattedTotal = totalFollowers >= 1000000
        ? `${(totalFollowers / 1000000).toFixed(1)}M`
        : totalFollowers >= 1000
        ? `${(totalFollowers / 1000).toFixed(0)}K`
        : totalFollowers.toString()

      // Update creator stats
      const { error: updateError } = await supabaseClient
        .from('creators')
        .update({
          total_followers: formattedTotal,
          last_stats_update: new Date().toISOString(),
        })
        .eq('id', creator.id)

      if (updateError) {
        console.error(`Error updating ${creator.name}:`, updateError)
      } else {
        console.log(`✓ Updated ${creator.name}`)
        updates.push(creator.name)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Updated ${updates.length} creators`,
        updated: updates,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

/* 
 * INSTRUCTIONS FOR REAL API INTEGRATION:
 * 
 * To fetch real follower counts from social media APIs, you'll need to:
 * 
 * 1. Instagram: Use the Instagram Graph API
 *    - Requires a Facebook App and Instagram Business Account
 *    - API endpoint: https://graph.instagram.com/me?fields=followers_count&access_token=YOUR_TOKEN
 * 
 * 2. YouTube: Use the YouTube Data API v3
 *    - Requires a Google Cloud project with YouTube API enabled
 *    - API endpoint: https://www.googleapis.com/youtube/v3/channels?part=statistics&id=CHANNEL_ID&key=YOUR_API_KEY
 * 
 * 3. TikTok: Use TikTok Display API
 *    - Requires TikTok Developer account
 *    - Limited to TikTok for Business accounts
 * 
 * 4. Twitter/X: Use Twitter API v2
 *    - Requires Twitter Developer account
 *    - API endpoint: https://api.twitter.com/2/users/:id?user.fields=public_metrics
 * 
 * Add the API keys as Supabase secrets and use them in this function.
 */
