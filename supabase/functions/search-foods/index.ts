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
            .ilike('name', `%${query}%`)
            .limit(20)

        if (localError) throw localError
        let results = localFoods.map((f: any) => ({ ...f, source: 'local', saved: true }))

        // 2. External Search (TACO API)
        // Only fetch if we need more results
        if (results.length < 20) {
            console.log('Fetching from TACO API...')
            try {
                const tacoQuery = `
                query GetAllFoods {
                    getAllFoods {
                        id
                        description
                        kcal
                        protein
                        carbohydrate
                        lipid
                        category {
                            category
                        }
                    }
                }
                `

                const resp = await fetch('https://taco-api.netlify.app/graphql', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: tacoQuery })
                })

                if (!resp.ok) {
                    console.error('TACO API Error:', resp.status, await resp.text())
                } else {
                    const data = await resp.json()
                    // Create a safe logging object
                    console.log('TACO Response Status:', resp.status)

                    const allFoods = data.data?.getAllFoods || []
                    console.log('TACO Total Foods Fetched:', allFoods.length)

                    // Simple case-insensitive filter
                    const filtered = allFoods.filter((f: any) =>
                        f.description && f.description.toLowerCase().includes(query.toLowerCase())
                    )
                    console.log('TACO Filtered Results:', filtered.length)

                    // Map to our format
                    const mappedExternal = filtered.map((f: any) => ({
                        id: null,
                        name: f.description,
                        external_fatsecret_id: f.id, // Using TACO ID here
                        description: f.category?.category || 'TACO DB',
                        brand: 'TACO',
                        fatsecret_type: 'Generic',
                        source: 'cloud',
                        source_type: 'taco_api', // Ensure this is set
                        saved: false,
                        // Add preview macros if available
                        calories_per_serving: f.kcal,
                        protein: f.protein,
                        carbs: f.carbohydrate,
                        fat: f.lipid
                    }))

                    // Deduplicate against local
                    const localIds = new Set(results.map((r: any) => r.external_fatsecret_id))
                    const uniqueExternal = mappedExternal.filter((e: any) => !localIds.has(e.external_fatsecret_id))

                    // Take only what we need to fill up to 30 or so
                    results = [...results, ...uniqueExternal].slice(0, 50)
                }
            } catch (err) {
                console.error('TACO Search Error Try/Catch:', err)
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

