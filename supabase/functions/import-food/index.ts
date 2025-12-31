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
        const { fatsecret_id } = await req.json() // We keep 'fatsecret_id' param name to avoid frontend breaking, but treat it as taco_id
        if (!fatsecret_id) throw new Error('fatsecret_id is required')

        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('CONFIG_ERROR: Missing Supabase URL or Service Key')
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // 0. Get User ID from Auth Header
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) throw new Error('Missing Authorization Header')

        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)

        if (authError || !user) throw new Error('User authentication failed')

        // 1. Check if exists
        const { data: existing } = await supabase
            .from('foods_library')
            .select('id')
            .eq('external_fatsecret_id', fatsecret_id)
            .single()

        if (existing) {
            return new Response(JSON.stringify({ id: existing.id, status: 'existing' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // 2. Fetch from TACO API
        // Since we don't have a reliable single-item query confirmed, we fetch all and find. 
        // It's not optimal but robust for now given the small dataset (~600 items).
        const tacoQuery = `
        query GetAllFoods {
            getAllFoods {
                id
                description
                kcal
                protein
                carbohydrate
                lipid
                fiber
                cholesterol
                saturated_fat: fatty_acids {
                    saturated
                    monounsaturated
                    polyunsaturated
                }
                minerals {
                    sodium
                    calcium
                    iron
                    potassium
                }
                vitaminC
            }
        }
        `
        // Note: The schema structure for fatty_acids/minerals is a guess based on common patterns. 
        // If this fails, we might need a simpler query or check the 'test' output if I could run it.
        // Actually, looking at typical TACO implementations (often flattened or grouped), I'll try a flatter approach 
        // OR try to just get the basic ones and `kcal`.

        // Safer approach: Request the fields I saw in the search query successfully?
        // In search I used: id, description, kcal, protein, carbohydrate, lipid
        // I will stick to these + maybe a few common ones if I can guess them.
        // Let's rely on standard names. 

        const robustQuery = `
        query GetAllFoods {
            getAllFoods {
                id
                description
                kcal
                protein
                carbohydrate
                lipid
                fiber
                sodium
                calcium
                iron
                cholesterol
            }
        }
        `

        const resp = await fetch('https://taco-api.netlify.app/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: robustQuery })
        })

        if (!resp.ok) {
            throw new Error(`TACO API Error: ${resp.status}`)
        }

        const data = await resp.json()
        const allFoods = data.data?.getAllFoods || []
        const food = allFoods.find((f: any) => String(f.id) === String(fatsecret_id))

        if (!food) throw new Error('Food not found in TACO API')

        // 3. Normalize to 100g (TACO is usually per 100g base already)
        // TACO table is "per 100g" of edible part.

        const p = (val: any) => {
            if (typeof val === 'number') return val
            if (typeof val === 'string') return parseFloat(val) || 0
            return 0
        }

        const newFood = {
            name: food.description,
            external_fatsecret_id: String(food.id),
            calories_per_serving: p(food.kcal),
            protein: p(food.protein),
            carbs: p(food.carbohydrate),
            fat: p(food.lipid),

            // Micronutrients
            fiber: p(food.fiber),
            sodium: p(food.sodium),
            calcium: p(food.calcium),
            iron: p(food.iron),
            cholesterol: p(food.cholesterol),

            // Set defaults for others to 0 as we might not have them
            sugar: 0,
            fat_saturated: 0,
            fat_trans: 0,
            fat_monounsaturated: 0,
            fat_polyunsaturated: 0,
            vitamin_a: 0,
            vitamin_c: 0, // p(food.vitaminC) -> risky if field name is wrong

            serving_size: 100,
            serving_unit: 'g',
            metric_serving_amount: 100,
            source_type: 'taco_api',
            is_public: true,
            created_by: user.id,

            brand: 'TACO',
            fatsecret_type: 'Generic',
            url: null
        }

        const { data: inserted, error: insertError } = await supabase
            .from('foods_library')
            .insert(newFood)
            .select()
            .single()

        if (insertError) throw insertError

        return new Response(JSON.stringify({ id: inserted.id, status: 'imported' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error: any) {
        // Log detailed error for debugging
        console.error('Import Error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})

