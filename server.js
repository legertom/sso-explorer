/**
 * Clever OAuth Integration Server
 * Express.js server implementing OAuth 2.0 flow with Clever education platform.
 */

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Validate required environment variables at startup
const requiredEnvVars = ['CLEVER_CLIENT_ID', 'CLEVER_CLIENT_SECRET', 'CLEVER_REDIRECT_URI'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    process.exit(1);
}

const app = express();

// Centralized configuration
const config = {
    port: process.env.PORT || 3000,
    clever: {
        clientId: process.env.CLEVER_CLIENT_ID,
        clientSecret: process.env.CLEVER_CLIENT_SECRET,
        redirectUri: process.env.CLEVER_REDIRECT_URI,
        baseUrl: 'https://clever.com',           // OAuth endpoints
        apiUrl: 'https://api.clever.com/v3.0'   // Data API endpoints
    }
};

// Default axios configuration with timeout and user agent
const axiosConfig = {
    timeout: 10000,
    headers: {
        'User-Agent': 'CleverPrintApp/1.0'
    }
};

// Security headers middleware
app.use(helmet());

// Rate limiting for auth routes - prevents brute force attacks
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per IP
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Express middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use('/auth', authLimiter);

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

/**
 * Escape JSON for safe HTML embedding - prevents XSS attacks
 * @param {Object} obj - Object to escape
 * @returns {string} - Escaped JSON string
 */
function escapeJsonForHtml(obj) {
    return JSON.stringify(obj)
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e');
}

/**
 * Fetch user data from Clever API
 * @param {string} accessToken - OAuth access token
 * @returns {Promise<Object>} - User, profile, and district data
 */
async function fetchCleverUserData(accessToken) {
    const headers = { 'Authorization': `Bearer ${accessToken}` };
    
    try {
        // Get basic user information
        const userResponse = await axios.get(`${config.clever.apiUrl}/me`, {
            headers,
            ...axiosConfig
        });
        
        const userId = userResponse.data?.data?.id;
        const districtId = userResponse.data?.data?.district;
        
        if (!userId || !districtId) {
            throw new Error('Invalid user data structure - missing user ID or district ID');
        }
        
        // Fetch profile and district data in parallel
        const [profileResponse, districtResponse] = await Promise.all([
            axios.get(`${config.clever.apiUrl}/users/${userId}`, { 
                headers,
                ...axiosConfig 
            }),
            axios.get(`${config.clever.apiUrl}/districts/${districtId}`, { 
                headers,
                ...axiosConfig 
            })
        ]);
        
        return {
            user: userResponse.data,
            profile: profileResponse.data,
            district: districtResponse.data
        };
    } catch (error) {
        console.error('Error fetching Clever data:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        throw error;
    }
}

// OAuth Step 1: Redirect to Clever authorization
app.get('/auth/clever', (req, res) => {
    const redirectUri = config.clever.redirectUri;
    const clientId = config.clever.clientId;
    
    console.log('Client ID:', clientId);
    console.log('Redirect URI:', redirectUri);
    
    // Build authorization URL with required OAuth parameters
    const authUrl = `${config.clever.baseUrl}/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=read:user_id read:districts read:schools read:teachers read:students`;
    
    console.log('Full auth URL:', authUrl);
    res.redirect(authUrl);
});

// OAuth Step 2: Handle authorization callback and exchange code for token
app.get('/auth/clever/callback', async (req, res) => {
    const { code } = req.query;
    
    // Validate authorization code
    if (!code || typeof code !== 'string' || code.length < 10) {
        console.error('Invalid authorization code received:', code);
        return res.status(400).send('Invalid authorization code provided');
    }

    try {
        // Exchange authorization code for access token
        const tokenResponse = await axios.post(`${config.clever.baseUrl}/oauth/tokens`, {
            client_id: config.clever.clientId,
            client_secret: config.clever.clientSecret,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: config.clever.redirectUri
        }, axiosConfig);

        const { access_token } = tokenResponse.data;
        
        if (!access_token) {
            throw new Error('No access token received from Clever');
        }
        
        console.log('=== FETCHING AVAILABLE CLEVER DATA ===');

        const cleverData = await fetchCleverUserData(access_token);

        // Structure data for frontend consumption
        const availableData = {
            authInfo: {
                token: access_token.substring(0, 20) + '...',
                tokenType: 'Bearer',
                scopes: 'District SSO - Basic Access'
            },
            me: cleverData.user,
            userProfile: cleverData.profile,
            district: cleverData.district,
            schools: { count: 0, data: [], available: false },
            teachers: { count: 0, data: [], available: false },
            students: { count: 0, data: [], available: false },
            sections: { count: 0, data: [], available: false },
            myTeacherSections: { count: 0, data: [], available: false }
        };

        console.log('Successfully fetched available data!');
        
        const escapedData = escapeJsonForHtml(availableData);
        
        // Return HTML page that stores data in localStorage and redirects
        res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Clever Login Success</title>
    <script>
        localStorage.setItem('cleverData', '${escapedData}');
        window.location.href = '/?login=success';
    </script>
</head>
<body>
    <p>Processing login...</p>
</body>
</html>
        `);

    } catch (error) {
        console.error('OAuth Error Details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            timestamp: new Date().toISOString()
        });
        
        // Extract user-friendly error message
        const errorMessage = error.response?.data?.error_description ||
                            error.response?.data?.error ||
                            error.message ||
                            'Authentication failed';
        
        res.redirect(`/?login=error&message=${encodeURIComponent(errorMessage)}`);
    }
});

// Start server
app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
    console.log('Environment:', process.env.NODE_ENV || 'development');
});