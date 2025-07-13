import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    if (req.method === 'POST') {
      // Handle ESP8266 data submission (supports both single bin and batch)
      const body = await req.json()
      console.log('Received ESP8266 data:', body)

      // Support both single bin and batch processing
      const bins = Array.isArray(body) ? body : [body];
      const insertData = [];
      
      // Validate each bin's data
      for (const binData of bins) {
        const { bin_id, level, location } = binData;
        
        if (!bin_id || typeof level !== 'number' || !location) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields: bin_id, level, location' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Validate level range
        if (level < 0 || level > 100) {
          return new Response(
            JSON.stringify({ error: `Level must be between 0 and 100 for bin ${bin_id}` }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        insertData.push({
          bin_id,
          level: Math.round(level),
          location
        });
      }

      // Insert all bin data into waste_bins table
      const { data, error } = await supabase
        .from('waste_bins')
        .insert(insertData)
        .select()

      if (error) {
        console.error('Database error:', error)
        return new Response(
          JSON.stringify({ error: 'Database error', details: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('Data inserted successfully:', data)
      return new Response(
        JSON.stringify({ 
          success: true, 
          data,
          bins_processed: bins.length,
          message: `Successfully updated ${bins.length} bin(s)`
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'GET') {
      // Handle data retrieval for dashboard
      const { data, error } = await supabase
        .from('waste_bins')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Database error:', error)
        return new Response(
          JSON.stringify({ error: 'Database error', details: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ data }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Server error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})