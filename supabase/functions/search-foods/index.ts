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
            let proxyUrl = Deno.env.get('VPS_PROXY_URL')
            const proxySecret = Deno.env.get('PROXY_SECRET')

            if (!proxyUrl || !proxySecret) return new Response(JSON.stringify({ error: 'Missing Proxy Keys', stage: 'env' }), { headers: corsHeaders })

            // Remove trailing slash if present
            if (proxyUrl.endsWith('/')) {
                proxyUrl = proxyUrl.slice(0, -1)
            }

            try {
                // Test Proxy Connection
                const searchResp = await fetch(`${proxyUrl}/search`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-proxy-secret': proxySecret
                    },
                    body: JSON.stringify({
                        query: 'test_apple',
                        max_results: 1
                    })
                })

                const searchText = await searchResp.text()
                let searchJson = null
                try { searchJson = JSON.parse(searchText) } catch (e) { }

                return new Response(JSON.stringify({
                    stage: 'proxy_debug_test',
                    proxy_url: proxyUrl,
                    status: searchResp.status,
                    raw_body: searchText,
                    parsed: searchJson
                }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
            } catch (err: any) {
                return new Response(JSON.stringify({ error: err.message, stage: 'proxy_fetch_error' }), { headers: corsHeaders })
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
            let proxyUrl = Deno.env.get('VPS_PROXY_URL')
            const proxySecret = Deno.env.get('PROXY_SECRET')

            if (proxyUrl && proxySecret) {
                if (proxyUrl.endsWith('/')) proxyUrl = proxyUrl.slice(0, -1)

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
