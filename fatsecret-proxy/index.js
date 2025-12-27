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
    try {
        const { query, max_results = 10 } = req.body;
        if (!query) return res.status(400).json({ error: 'Query required' });

        const token = await getAccessToken();
        const response = await axios.get('https://platform.fatsecret.com/rest/server.api', {
            params: {
                method: 'foods.search.v2',
                format: 'json',
                search_expression: query,
                max_results: max_results
            },
            headers: { Authorization: `Bearer ${token}` }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Search error:', error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || 'Proxied Search Failed' });
    }
});

app.post('/food', authenticate, async (req, res) => {
    try {
        const { food_id } = req.body;
        if (!food_id) return res.status(400).json({ error: 'food_id required' });

        const token = await getAccessToken();
        const response = await axios.get('https://platform.fatsecret.com/rest/server.api', {
            params: {
                method: 'food.get.v2',
                format: 'json',
                food_id: food_id
            },
            headers: { Authorization: `Bearer ${token}` }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Get Food error:', error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || 'Proxied Get Food Failed' });
    }
});

app.get('/health', (req, res) => res.send('OK'));

app.listen(PORT, () => {
    console.log(`FatSecret Proxy running on port ${PORT}`);
});
