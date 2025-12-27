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
        const { fatsecret_id } = await req.json()
        if (!fatsecret_id) throw new Error('fatsecret_id is required')

        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') // Use Service Role to write system foods

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('CONFIG_ERROR: Missing Supabase URL or Service Key')
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

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

        // 2. Fetch from API
        const clientId = Deno.env.get('FATSECRET_CLIENT_ID')
        const clientSecret = Deno.env.get('FATSECRET_CLIENT_SECRET')

        const tokenResp = await fetch('https://oauth.fatsecret.com/connect/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `grant_type=client_credentials&scope=basic&client_id=${clientId}&client_secret=${clientSecret}`
        })
        const { access_token } = await tokenResp.json()
        if (!access_token) throw new Error('Failed to get upstream token')

        const foodResp = await fetch(`https://platform.fatsecret.com/rest/server.api?method=food.get.v2&format=json&food_id=${fatsecret_id}`, {
            headers: { Authorization: `Bearer ${access_token}` }
        })
        const foodData = await foodResp.json()
        const food = foodData.food

        if (!food) throw new Error('Food not found in upstream')

        // 3. Normalize (Take 100g serving or first avail)
        // FatSecret often returns servings.servings.serving as array or object
        let servings = food.servings.serving
        if (!Array.isArray(servings)) servings = [servings]

        // Find 100g or 100ml or closest
        let targetServing = servings.find((s: any) => s.metric_serving_unit === 'g' && s.metric_serving_amount === '100.000')
            || servings[0]

        // Calculate factor to normalize to 100g if needed, but for simplicity let's store base 100g if possible.
        // If we just store what we retrieved, we should store serving size.
        // User requested: "Normalizar... Converte os dados da API para a estrutura (ex: 100g como padrão)"
        // If the API gives us `calcium` for `30g`, we need to math it to `100g`.

        const baseAmount = parseFloat(targetServing.metric_serving_amount || '100')
        const multiplier = 100 / (baseAmount || 1) // To get to 100g/ml check div by zero

        // Helper to parse
        const p = (val: string) => parseFloat(val || '0') * multiplier

        const newFood = {
            name: food.food_name,
            external_fatsecret_id: food.food_id,
            calories_per_serving: p(targetServing.calories),
            protein: p(targetServing.protein),
            carbs: p(targetServing.carbohydrate),
            fat: p(targetServing.fat),
            serving_size: 100,
            serving_unit: 'g',
            metric_serving_amount: 100,
            source_type: 'fatsecret_api',
            is_public: true
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
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
