import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { query } = await req.json()
        if (!query) throw new Error('Query is required')

        // Initialize Supabase Client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('CONFIG_ERROR: Missing Supabase URL or Key')
        }

        const supabase = createClient(supabaseUrl, supabaseKey)

        // 1. Local Search
        const { data: localFoods, error: localError } = await supabase
            .from('foods_library')
            .select('*')
            .ilike('name', `%${query}%`)
            .limit(10)

        if (localError) throw localError

        let results = localFoods.map((f: any) => ({ ...f, source: 'local', saved: true }))

        // 2. External Search (if needed)
        if (results.length < 10) {
            // Get FatSecret Token
            const clientId = Deno.env.get('FATSECRET_CLIENT_ID')
            const clientSecret = Deno.env.get('FATSECRET_CLIENT_SECRET')

            if (clientId && clientSecret) {
                const tokenResp = await fetch('https://oauth.fatsecret.com/connect/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `grant_type=client_credentials&scope=basic&client_id=${clientId}&client_secret=${clientSecret}`
                })

                if (tokenResp.ok) {
                    const { access_token } = await tokenResp.json()

                    if (access_token) {
                        // Call FatSecret Search
                        const searchResp = await fetch(`https://platform.fatsecret.com/rest/server.api?method=foods.search&format=json&search_expression=${encodeURIComponent(query)}&max_results=${10 - results.length}`, {
                            headers: { Authorization: `Bearer ${access_token}` }
                        })

                        if (searchResp.ok) {
                            const searchData = await searchResp.json()
                            const externalFoods = searchData?.foods?.food || []

                            // Map external foods
                            const mappedExternal = (Array.isArray(externalFoods) ? externalFoods : [externalFoods]).map((f: any) => ({
                                id: null, // No local ID yet
                                name: f.food_name,
                                external_fatsecret_id: f.food_id,
                                description: f.food_description, // Usually contains calories info string
                                source: 'cloud',
                                saved: false
                            }))

                            // check for duplicates by external_fatsecret_id in local results (optional optimization)
                            const localIds = new Set(results.map((r: any) => r.external_fatsecret_id))
                            const uniqueExternal = mappedExternal.filter((e: any) => !localIds.has(e.external_fatsecret_id))

                            results = [...results, ...uniqueExternal]
                        }
                    }
                }
            }
        }

        return new Response(JSON.stringify({ foods: results }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
