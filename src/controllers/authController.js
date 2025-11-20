const axios = require('axios');
const config = require('../config');

const authController = {
    login: (req, res) => {
        const { clientId, redirectUri, baseUrl } = config.clever;
        const scope = 'read:user_id read:districts read:schools read:teachers read:students';
        const authUrl = `${baseUrl}/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`;
        res.redirect(authUrl);
    },

    callback: async (req, res) => {
        const { code } = req.query;

        if (!code) {
            return res.redirect('/?login=error&message=No code provided');
        }

        try {
            const tokenResponse = await axios.post(`${config.clever.baseUrl}/oauth/tokens`, {
                client_id: config.clever.clientId,
                client_secret: config.clever.clientSecret,
                code,
                grant_type: 'authorization_code',
                redirect_uri: config.clever.redirectUri
            });

            const { access_token } = tokenResponse.data;

            // Store token in HTTP-only session
            req.session.token = access_token;

            res.redirect('/?login=success');
        } catch (error) {
            console.error('Auth Error:', error.message);
            res.redirect('/?login=error&message=Authentication failed');
        }
    },

    logout: (req, res) => {
        req.session.destroy((err) => {
            if (err) console.error('Logout error:', err);
            res.redirect('/');
        });
    }
};

module.exports = authController;
