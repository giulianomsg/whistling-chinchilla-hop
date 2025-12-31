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

        // 2. Fetch from TACO Local Data
        const food = (tacoData as any[]).find(f => String(f.id) === String(fatsecret_id))

        if (!food) throw new Error('Food not found in TACO data')

        // 3. Normalize (TACO is 100g base)
        const p = (val: any) => {
            if (typeof val === 'number') return val
            if (typeof val === 'string' && val !== 'NA' && val !== 'Tr' && val !== '') return parseFloat(val.replace(',', '.'))
            return 0
        }

        const newFood = {
            name: food.description,
            external_fatsecret_id: String(food.id),
            calories_per_serving: p(food.energy_kcal),
            protein: p(food.protein_g),
            carbs: p(food.carbohydrate_g),
            fat: p(food.lipid_g),

            // Micronutrients (Mapping from taco.json keys)
            fiber: p(food.fiber_g),
            sodium: p(food.sodium_mg),
            calcium: p(food.calcium_mg),
            iron: p(food.iron_mg),
            cholesterol: p(food.cholesterol_mg),

            // Others (check if mapped)
            sugar: 0, // TACO doesn't explicitly separate sugar usually
            fat_saturated: p(food.saturated_g),
            fat_trans: 0,
            fat_monounsaturated: p(food.monounsaturated_g),
            fat_polyunsaturated: p(food.polyunsaturated_g),
            vitamin_a: 0, // Need to checking RE/RAE
            vitamin_c: p(food.vitaminC_mg),

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

