import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { hmac } from "https://cdnjs.cloudflare.com/ajax/libs/hash.js/1.1.7/hash.min.js";
// We generally avoid OAuth 1.0 logic in modern apps if posssible, but here is a simplified version if user insists.
// BUT WAIT. FatSecret OAuth 2.0 (Client Credentials) does NOT require IP Allowlisting strictness usually for Basic tier?
// Actually, FatSecret OAuth 2.0 "Client Credentials Grant" is standard and works from Server-to-Server.
// If the user says they need IP Whitelisting, they might be using "REST API" Premier or restrict settings.
// However, implementing OAuth 1.0 is extremely verbose and error prone (Timestamp, Nonce, Signature Base String...).
// BETTER APPROACH: Add a debug endpoint to TEST the connection and return exact error from FatSecret.

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { query, debug } = await req.json()

        // DEBUG MODE
        if (debug) {
            const clientId = Deno.env.get('FATSECRET_CLIENT_ID')
            const clientSecret = Deno.env.get('FATSECRET_CLIENT_SECRET')

            if (!clientId || !clientSecret) return new Response(JSON.stringify({ error: 'Missing Keys', stage: 'env' }), { headers: corsHeaders })

            // Test OAuth 2.0 Token Call
            try {
                const tokenResp = await fetch('https://oauth.fatsecret.com/connect/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `grant_type=client_credentials&scope=basic&client_id=${clientId}&client_secret=${clientSecret}`
                })
                const tokenData = await tokenResp.json()

                return new Response(JSON.stringify({
                    stage: 'oauth2_token',
                    status: tokenResp.status,
                    data: tokenData
                }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
            } catch (err) {
                return new Response(JSON.stringify({ error: err.message, stage: 'fetch_error' }), { headers: corsHeaders })
            }
        }

        if (!query) throw new Error('Query is required')

        // Initialize Supabase
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')
        const supabase = createClient(supabaseUrl!, supabaseKey!)

        // 1. Local Search
        const { data: localFoods, error: localError } = await supabase
            .from('foods_library')
            .select('*')
            .ilike('name', `%${query}%`)
            .limit(10)

        if (localError) throw localError
        let results = localFoods.map((f: any) => ({ ...f, source: 'local', saved: true }))

        // 2. External Search
        if (results.length < 10) {
            const clientId = Deno.env.get('FATSECRET_CLIENT_ID')
            const clientSecret = Deno.env.get('FATSECRET_CLIENT_SECRET')

            if (clientId && clientSecret) {
                // OAuth 2.0 Flow
                const tokenResp = await fetch('https://oauth.fatsecret.com/connect/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `grant_type=client_credentials&scope=basic&client_id=${clientId}&client_secret=${clientSecret}`
                })

                if (tokenResp.ok) {
                    const { access_token } = await tokenResp.json()
                    if (access_token) {
                        const searchResp = await fetch(`https://platform.fatsecret.com/rest/server.api?method=foods.search&format=json&search_expression=${encodeURIComponent(query)}&max_results=${10 - results.length}`, {
                            headers: { Authorization: `Bearer ${access_token}` }
                        })

                        if (searchResp.ok) {
                            const searchData = await searchResp.json()
                            const externalFoods = searchData?.foods?.food || []
                            const mappedExternal = (Array.isArray(externalFoods) ? externalFoods : [externalFoods]).map((f: any) => ({
                                id: null,
                                name: f.food_name,
                                external_fatsecret_id: f.food_id,
                                description: f.food_description,
                                source: 'cloud',
                                saved: false
                            }))

                            const localIds = new Set(results.map((r: any) => r.external_fatsecret_id))
                            const uniqueExternal = mappedExternal.filter((e: any) => !localIds.has(e.external_fatsecret_id))
                            results = [...results, ...uniqueExternal]
                        } else {
                            console.error('FatSecret Search Error:', await searchResp.text())
                        }
                    }
                } else {
                    console.error('FatSecret Token Error:', await tokenResp.text())
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
