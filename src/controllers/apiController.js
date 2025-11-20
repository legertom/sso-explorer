const axios = require('axios');
const config = require('../config');

const apiController = {
    getMe: async (req, res) => {
        if (!req.session.token) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        try {
            const headers = {
                'Authorization': `Bearer ${req.session.token}`,
                'User-Agent': 'CleverPrintApp/1.0'
            };

            // Parallel fetch for basic user info
            const userResponse = await axios.get(`${config.clever.apiUrl}/me`, { headers });
            const userId = userResponse.data.data.id;
            const districtId = userResponse.data.data.district;

            const [profileResponse, districtResponse] = await Promise.all([
                axios.get(`${config.clever.apiUrl}/users/${userId}`, { headers }),
                axios.get(`${config.clever.apiUrl}/districts/${districtId}`, { headers })
            ]);

            res.json({
                authInfo: {
                    token: 'HIDDEN_FOR_SECURITY', // Don't send full token to client
                    scopes: 'District SSO'
                },
                me: userResponse.data,
                userProfile: profileResponse.data,
                district: districtResponse.data
            });

        } catch (error) {
            console.error('API Error:', error.message);
            res.status(500).json({ error: 'Failed to fetch data' });
        }
    }
};

module.exports = apiController;
