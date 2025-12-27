require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3001;
const CLIENT_ID = process.env.FATSECRET_CLIENT_ID;
const CLIENT_SECRET = process.env.FATSECRET_CLIENT_SECRET;
const PROXY_SECRET = process.env.PROXY_SECRET;

// In-memory token cache
let accessToken = null;
let tokenExpiresAt = 0;

// Middleware to check shared secret
const authenticate = (req, res, next) => {
    const secret = req.headers['x-proxy-secret'];
    if (!secret || secret !== PROXY_SECRET) {
        return res.status(403).json({ error: 'Unauthorized Proxy Access' });
    }
    next();
};

const getAccessToken = async () => {
    const now = Date.now();
    if (accessToken && now < tokenExpiresAt) {
        return accessToken;
    }

    console.log('Refreshing FatSecret Token...');
    try {
        const response = await axios.post('https://oauth.fatsecret.com/connect/token',
            `grant_type=client_credentials&scope=basic&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
        );

        accessToken = response.data.access_token;
        // Expires in is usually seconds, convert to ms and subtract a buffer (e.g. 60s)
        tokenExpiresAt = now + (response.data.expires_in * 1000) - 60000;
        return accessToken;
    } catch (error) {
        console.error('Error fetching token:', error.response?.data || error.message);
        throw new Error('Failed to authenticate with FatSecret');
    }
};

app.post('/search', authenticate, async (req, res) => {
    const { query, max_results, translate: doTranslate } = req.body; // Added translate param

    try {
        if (!query) return res.status(400).json({ error: 'Query required' });

        const token = await getAccessToken();

        let searchQuery = query;
        if (doTranslate) {
            try {
                // 1. Translate Query (PT -> EN)
                const tRes = await translate(query, { to: 'en' });
                if (tRes.text) searchQuery = tRes.text;
                console.log(`[Translate DEBUG] Original: '${query}' -> Translated: '${searchQuery}'`);
            } catch (e) {
                console.error('Translation error (query):', e.message);
            }
        }

        const response = await axios.get('https://platform.fatsecret.com/rest/server.api', {
            params: {
                method: 'foods.search',
                format: 'json',
                search_expression: searchQuery,
                max_results: max_results,
                // Force US/EN to ensure translation source is consistent
                region: 'US',
                language: 'en'
            },
            headers: { Authorization: `Bearer ${token}` }
        });

        let data = response.data;
        console.log('[Proxy DEBUG] FatSecret Response Status:', response.status);

        if (doTranslate && data.foods && data.foods.food) {
            console.log('[Proxy DEBUG] Translating results...');
            // 2. Translate Results (EN -> PT)
            // Handle single or array results
            const foods = Array.isArray(data.foods.food) ? data.foods.food : [data.foods.food];

            // Translate names in parallel batch
            await Promise.all(foods.map(async (f) => {
                try {
                    const originalName = f.food_name;
                    const tName = await translate(f.food_name, { to: 'pt', from: 'en' });
                    f.food_name = tName.text;
                    console.log(`[Translate DEBUG] Food: '${originalName}' -> '${f.food_name}'`);

                    if (f.food_description) {
                        // Optional: Translate description too or leave as is
                    }
                } catch (e) { console.error('Translation error (result):', e.message); }
            }));
        } else {
            console.log('[Proxy DEBUG] No translation performed on results (translate flag: ' + doTranslate + ', foods found: ' + (!!data.foods) + ')');
        }

        res.json(data);
    } catch (error) {
        console.error('Search Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

app.post('/food', authenticate, async (req, res) => {
    const { food_id, translate: doTranslate } = req.body;

    if (!food_id) return res.status(400).json({ error: 'Missing food_id' });

    try {
        const token = await getAccessToken();
        const response = await axios.get('https://platform.fatsecret.com/rest/server.api', {
            params: {
                method: 'food.get.v2',
                format: 'json',
                food_id: food_id
            },
            headers: { Authorization: `Bearer ${token}` }
        });

        let data = response.data;

        if (doTranslate && data.food) {
            try {
                // Translate Name
                const tName = await translate(data.food.food_name, { to: 'pt', from: 'en' });
                data.food.food_name = tName.text;

                // Translate Brand (if exists)
                if (data.food.brand_name) {
                    const tBrand = await translate(data.food.brand_name, { to: 'pt', from: 'en' });
                    data.food.brand_name = tBrand.text;
                }

                // Servings names (e.g., "1 cup", "1 oz")
                if (data.food.servings && data.food.servings.serving) {
                    const servings = Array.isArray(data.food.servings.serving) ? data.food.servings.serving : [data.food.servings.serving];
                    await Promise.all(servings.map(async (s) => {
                        if (s.serving_description) {
                            const tDesc = await translate(s.serving_description, { to: 'pt', from: 'en' });
                            s.serving_description = tDesc.text;
                        }
                        if (s.measurement_description) {
                            const tMeas = await translate(s.measurement_description, { to: 'pt', from: 'en' });
                            s.measurement_description = tMeas.text;
                        }
                    }));
                }
            } catch (e) {
                console.error('Translation error (food detail):', e.message);
            }
        }

        res.json(data);
    } catch (error) {
        console.error('Food Get Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ error: error.response?.data || 'Proxied Get Food Failed' });
    }
});

app.get('/health', (req, res) => res.send('OK'));

app.listen(PORT, () => {
    console.log(`FatSecret Proxy running on port ${PORT}`);
});
