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

// Security headers middleware with CSP configuration
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts for callback page
            scriptSrcAttr: ["'unsafe-inline'"], // Allow inline event handlers
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    }
}));

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
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'CleverPrintApp/1.0'
    };
    
    try {
        // Get basic user information
        const userResponse = await axios.get(`${config.clever.apiUrl}/me`, {
            headers,
            timeout: 10000
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
                timeout: 10000
            }),
            axios.get(`${config.clever.apiUrl}/districts/${districtId}`, {
                headers,
                timeout: 10000
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
        console.log('Exchanging code for token...');
        const tokenResponse = await axios.post(`${config.clever.baseUrl}/oauth/tokens`, {
            client_id: config.clever.clientId,
            client_secret: config.clever.clientSecret,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: config.clever.redirectUri
        }, {
            timeout: 10000,
            headers: {
                'User-Agent': 'CleverPrintApp/1.0',
                'Content-Type': 'application/json'
            }
        });

        const { access_token } = tokenResponse.data;
        
        if (!access_token) {
            throw new Error('No access token received from Clever');
        }
        
        console.log('Access token received, length:', access_token.length);
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
        console.log('Available data keys:', Object.keys(availableData));
        console.log('Data structure:');
        console.log('- authInfo:', typeof availableData.authInfo);
        console.log('- me:', typeof availableData.me);
        console.log('- userProfile:', typeof availableData.userProfile);
        console.log('- district:', typeof availableData.district);
        
        try {
            console.log('Step 1: Converting data to JSON string...');
            const jsonString = JSON.stringify(availableData);
            console.log('Step 2: JSON string created, length:', jsonString.length);
            
            console.log('Step 3: Converting to base64...');
            const dataString = Buffer.from(jsonString).toString('base64');
            console.log('Step 4: Base64 string created, length:', dataString.length);
            
            console.log('Step 5: Creating HTML response...');

            const htmlResponse = `
<!DOCTYPE html>
<html>
<head>
    <title>Clever Login Success</title>
    <script id="clever-data" type="application/json">${escapeJsonForHtml(availableData)}</script>
    <script>
        window.addEventListener('DOMContentLoaded', function() {
            try {
                var scriptTag = document.getElementById('clever-data');
                var cleverData = JSON.parse(scriptTag.textContent);
                localStorage.setItem('cleverData', JSON.stringify(cleverData));
                window.location.replace('/?login=success');
            } catch (error) {
                window.location.replace('/?login=error&message=' + encodeURIComponent(error.message));
            }
        });
    </script>
</head>
<body>
    <p>Finalizing Clever login…</p>
</body>
</html>
`;

            console.log('Step 6: HTML response created, length:', htmlResponse.length);
            console.log('Step 7: Sending response...');

            res.send(htmlResponse);

            console.log('Step 8: Response sent successfully!');

        } catch (error) {
            console.error('ERROR in response generation:', error);
            console.error('Error stack:', error.stack);
            res.redirect(`/?login=error&message=${encodeURIComponent('Server error generating response')}`);
        }

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
