require('dotenv').config();

const requiredEnvVars = ['CLEVER_CLIENT_ID', 'CLEVER_CLIENT_SECRET', 'CLEVER_REDIRECT_URI'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    process.exit(1);
}

module.exports = {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    sessionSecret: process.env.SESSION_SECRET || 'dev-secret-key-change-in-prod',
    clever: {
        clientId: process.env.CLEVER_CLIENT_ID,
        clientSecret: process.env.CLEVER_CLIENT_SECRET,
        redirectUri: process.env.CLEVER_REDIRECT_URI,
        baseUrl: 'https://clever.com',
        apiUrl: 'https://api.clever.com/v3.0'
    }
};
