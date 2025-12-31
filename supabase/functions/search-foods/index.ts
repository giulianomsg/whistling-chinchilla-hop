import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import tacoData from './taco.json' with { type: "json" }

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { query } = await req.json()
        if (!query) throw new Error('Query is required')

        // Initialize Supabase
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')
        const supabase = createClient(supabaseUrl!, supabaseKey!)

        // 1. Local Search
        const { data: localFoods, error: localError } = await supabase
            .from('foods_library')
            .select('*')
            .ilike('name', '%' + query + '%')
            .limit(20)

        if (localError) throw localError
        let results = localFoods.map((f: any) => ({ ...f, source: 'local', saved: true }))

        // 2. Local Static TACO Search
        if (results.length < 50) {
            try {
                const qLower = query.toLowerCase()

                // Filter TACO data
                const tacoResults = (tacoData as any[]).filter(f =>
                    f.description && f.description.toLowerCase().includes(qLower)
                )

                console.log('Found ' + tacoResults.length + ' matches in TACO local data')

                // Helper to parse numeric values safely
                const p = (val: any) => {
                    if (typeof val === 'number') return val
                    if (typeof val === 'string' && val !== 'NA' && val !== 'Tr' && val !== '') return parseFloat(val.replace(',', '.'))
                    return 0
                }

                const mappedTaco = tacoResults.map(f => ({
                    id: null,
                    name: f.description,
                    external_fatsecret_id: String(f.id), // Use TACO ID stringified
                    description: f.category || 'TACO',
                    brand: 'TACO',
                    fatsecret_type: 'Generic',
                    source: 'cloud',
                    source_type: 'taco_api',
                    saved: false,

                    // Macro/Micro mapping
                    calories_per_serving: p(f.energy_kcal),
                    protein: p(f.protein_g),
                    carbs: p(f.carbohydrate_g),
                    fat: p(f.lipid_g),

                    // Extra fields for preview if needed
                    serving_size: 100,
                    serving_unit: 'g'
                }))

                // Deduplicate
                const localIds = new Set(results.map((r: any) => r.external_fatsecret_id))
                const uniqueTaco = mappedTaco.filter(e => !localIds.has(e.external_fatsecret_id))

                results = [...results, ...uniqueTaco].slice(0, 50)

            } catch (err) {
                console.error('Local TACO Processing Error:', err)
            }
        }

        return new Response(JSON.stringify({ foods: results }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error: any) {
        console.error('General Function Error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})

