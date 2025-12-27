import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'


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

            try {
                // 1. Get Token
                const tokenResp = await fetch('https://oauth.fatsecret.com/connect/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `grant_type=client_credentials&scope=basic&client_id=${clientId}&client_secret=${clientSecret}`
                })
                const tokenData = await tokenResp.json()

                if (!tokenResp.ok || !tokenData.access_token) {
                    return new Response(JSON.stringify({
                        stage: 'oauth2_token_fail',
                        status: tokenResp.status,
                        error: tokenData
                    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
                }

                // 2. Try Search (Force test)
                const testQuery = query || 'apple'

                // FatSecret sometimes strictly checks Accept header or User-Agent
                const searchResp = await fetch(`https://platform.fatsecret.com/rest/server.api?method=foods.search.v2&format=json&search_expression=${encodeURIComponent(testQuery)}&max_results=3`, {
                    headers: {
                        Authorization: `Bearer ${tokenData.access_token}`,
                        'Content-Type': 'application/json',
                        'X-Forwarded-For': req.headers.get('x-forwarded-for') || '127.0.0.1'
                    }
                })

                const searchText = await searchResp.text()
                let searchJson = null
                try { searchJson = JSON.parse(searchText) } catch (e) { }

                return new Response(JSON.stringify({
                    stage: 'fatsecret_search_test',
                    query: testQuery,
                    status: searchResp.status,
                    raw_body: searchText,
                    parsed: searchJson
                }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
            } catch (err) {
                return new Response(JSON.stringify({ error: err.message, stage: 'fetch_error_debug' }), { headers: corsHeaders })
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
            const proxyUrl = Deno.env.get('VPS_PROXY_URL')
            const proxySecret = Deno.env.get('PROXY_SECRET')

            if (proxyUrl && proxySecret) {
                try {
                    // Call Proxy
                    const searchResp = await fetch(`${proxyUrl}/search`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-proxy-secret': proxySecret
                        },
                        body: JSON.stringify({
                            query: query,
                            max_results: 10 - results.length
                        })
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
                        console.error('Proxy Search Error:', await searchResp.text())
                    }
                } catch (proxyErr) {
                    console.error('Proxy Connection Error:', proxyErr)
                }
            } else {
                console.error('Missing Proxy Configuration (VPS_PROXY_URL or PROXY_SECRET)')
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
