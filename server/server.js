const express = require('express');
const cors = require('cors');
const axios = require('axios');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: [
        process.env.FRONTEND_URL || 'https://PsandersSilverchair.github.io',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        null  // Allow file:// protocol for local development
    ],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Parse JSON bodies
app.use(express.json());

// Store for access tokens (in production, use Redis or database)
const tokenStore = new Map();

// Salesforce OAuth configuration
const SALESFORCE_CONFIG = {
    clientId: process.env.SALESFORCE_CLIENT_ID,
    clientSecret: process.env.SALESFORCE_CLIENT_SECRET,
    redirectUri: process.env.SALESFORCE_REDIRECT_URI,
    salesforceUrl: process.env.SALESFORCE_URL
};

// Generate PKCE verifier and challenge
function generateCodeVerifier() {
    const array = new Uint8Array(32);
    require('crypto').randomFillSync(array);
    return Buffer.from(array).toString('base64url');
}

function generateCodeChallenge(verifier) {
    return require('crypto')
        .createHash('sha256')
        .update(verifier)
        .digest('base64url');
}

// Routes

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start OAuth flow
app.post('/api/auth/start', (req, res) => {
    try {
        const { salesforceUrl, redirectPage } = req.body;
        
        if (!salesforceUrl) {
            return res.status(400).json({ error: 'Salesforce URL is required' });
        }

        // Generate PKCE parameters
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = generateCodeChallenge(codeVerifier);
        const state = require('crypto').randomBytes(16).toString('hex');

        // Store PKCE verifier and state
        tokenStore.set(state, {
            codeVerifier,
            salesforceUrl,
            redirectPage: redirectPage || 'salesforce-integration.html',
            timestamp: Date.now()
        });

        // Build authorization URL
        const authUrl = new URL('/services/oauth2/authorize', salesforceUrl);
        authUrl.searchParams.append('response_type', 'code');
        authUrl.searchParams.append('client_id', SALESFORCE_CONFIG.clientId);
        authUrl.searchParams.append('redirect_uri', SALESFORCE_CONFIG.redirectUri);
        authUrl.searchParams.append('scope', 'api id');
        authUrl.searchParams.append('code_challenge', codeChallenge);
        authUrl.searchParams.append('code_challenge_method', 'S256');
        authUrl.searchParams.append('state', state);

        res.json({ authUrl: authUrl.toString() });
    } catch (error) {
        console.error('Auth start error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Handle OAuth callback
app.get('/api/auth/callback', async (req, res) => {
    try {
        const { code, state, error } = req.query;

        if (error) {
            return res.status(400).json({ error: error, description: req.query.error_description });
        }

        if (!code || !state) {
            return res.status(400).json({ error: 'Invalid callback parameters' });
        }

        // Retrieve stored PKCE data
        const storedData = tokenStore.get(state);
        if (!storedData) {
            return res.status(400).json({ error: 'Invalid or expired state parameter' });
        }

        // Clean up stored data
        tokenStore.delete(state);

        // Exchange code for access token
        const tokenResponse = await axios.post(
            `${storedData.salesforceUrl}/services/oauth2/token`,
            new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                client_id: SALESFORCE_CONFIG.clientId,
                client_secret: SALESFORCE_CONFIG.clientSecret,
                redirect_uri: SALESFORCE_CONFIG.redirectUri,
                code_verifier: storedData.codeVerifier
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const { access_token, instance_url, id } = tokenResponse.data;

        // Generate session token for frontend
        const sessionToken = require('crypto').randomBytes(32).toString('hex');
        
        // Store access token with session
        tokenStore.set(sessionToken, {
            accessToken: access_token,
            instanceUrl: instance_url,
            userId: id,
            timestamp: Date.now()
        });

        // For popup-based auth, return HTML with session token instead of redirect
        const redirectPage = storedData.redirectPage || 'salesforce-integration.html';
        
        // Always redirect back to the specified page with session token
        const frontendUrl = new URL(`/s1m-customer-requirements-form/${redirectPage}`, process.env.FRONTEND_URL);
        frontendUrl.searchParams.append('session', sessionToken);
        frontendUrl.searchParams.append('success', 'true');
        res.redirect(frontendUrl.toString());
    } catch (error) {
        console.error('Auth callback error:', error);
        
        // Return error HTML for popup-based auth
        res.send(`
            <!DOCTYPE html>
            <html>
            <head><title>Authentication Failed</title></head>
            <body>
                <div style="text-align: center; padding: 40px; font-family: Arial; color: #dc3545;">
                    <h2>Authentication Failed</h2>
                    <p>Please close this window and try again.</p>
                </div>
                <script>
                    setTimeout(() => window.close(), 3000);
                </script>
            </body>
            </html>
        `);
    }
});

// Search customers
app.get('/api/customers/search', async (req, res) => {
    try {
        const { q: searchTerm, session } = req.query;

        if (!searchTerm) {
            return res.status(400).json({ error: 'Search term is required' });
        }

        if (!session) {
            return res.status(401).json({ error: 'Session token is required' });
        }

        // Retrieve session data
        const sessionData = tokenStore.get(session);
        if (!sessionData) {
            return res.status(401).json({ 
                error: 'Invalid or expired session',
                code: 'SESSION_EXPIRED',
                message: 'Please reconnect to Salesforce'
            });
        }

        // Check if session is too old (2 hours)
        const sessionAge = Date.now() - sessionData.timestamp;
        const maxSessionAge = 2 * 60 * 60 * 1000; // 2 hours
        if (sessionAge > maxSessionAge) {
            tokenStore.delete(session);
            return res.status(401).json({ 
                error: 'Session expired',
                code: 'SESSION_EXPIRED',
                message: 'Session has been expired for security reasons'
            });
        }

        // Build SOSL query
        const soqlQuery = `FIND {${searchTerm}*} IN NAME FIELDS RETURNING Account(Id, Name, Type, Phone, Website, BillingCity, BillingState, BillingCountry) LIMIT 25`;

        // Make API call to Salesforce
        const response = await axios.get(
            `${sessionData.instanceUrl}/services/data/v58.0/search/`,
            {
                params: { q: soqlQuery },
                headers: {
                    'Authorization': `Bearer ${sessionData.accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Extract Account records
        const accounts = response.data.searchRecords || [];
        
        res.json({
            success: true,
            count: accounts.length,
            customers: accounts.map(account => ({
                id: account.Id,
                name: account.Name,
                type: account.Type,
                phone: account.Phone,
                website: account.Website,
                city: account.BillingCity,
                state: account.BillingState,
                country: account.BillingCountry
            }))
        });
    } catch (error) {
        console.error('Customer search error:', error);
        
        if (error.response?.status === 401) {
            // Salesforce token expired, clean up our session
            tokenStore.delete(session);
            return res.status(401).json({ 
                error: 'Salesforce authentication expired',
                code: 'SALESFORCE_TOKEN_EXPIRED',
                message: 'Your Salesforce session has expired. Please reconnect.'
            });
        }
        
        res.status(500).json({ 
            error: 'Search failed', 
            details: error.response?.data?.message || error.message,
            code: 'SEARCH_ERROR'
        });
    }
});

// Get customer details
app.get('/api/customers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { session } = req.query;

        if (!session) {
            return res.status(401).json({ error: 'Session token is required' });
        }

        // Retrieve session data
        const sessionData = tokenStore.get(session);
        if (!sessionData) {
            return res.status(401).json({ 
                error: 'Invalid or expired session',
                code: 'SESSION_EXPIRED',
                message: 'Please reconnect to Salesforce'
            });
        }

        // Check if session is too old (2 hours)
        const sessionAge = Date.now() - sessionData.timestamp;
        const maxSessionAge = 2 * 60 * 60 * 1000; // 2 hours
        if (sessionAge > maxSessionAge) {
            tokenStore.delete(session);
            return res.status(401).json({ 
                error: 'Session expired',
                code: 'SESSION_EXPIRED',
                message: 'Session has been expired for security reasons'
            });
        }

        // Get customer details from Salesforce
        const response = await axios.get(
            `${sessionData.instanceUrl}/services/data/v58.0/sobjects/Account/${id}`,
            {
                headers: {
                    'Authorization': `Bearer ${sessionData.accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const account = response.data;
        
        res.json({
            success: true,
            customer: {
                id: account.Id,
                name: account.Name,
                type: account.Type,
                phone: account.Phone,
                website: account.Website,
                email: account.Email,
                city: account.BillingCity,
                state: account.BillingState,
                country: account.BillingCountry,
                postalCode: account.BillingPostalCode,
                street: account.BillingStreet,
                description: account.Description,
                industry: account.Industry,
                employeeCount: account.NumberOfEmployees,
                annualRevenue: account.AnnualRevenue
            }
        });
    } catch (error) {
        console.error('Customer details error:', error);
        
        if (error.response?.status === 401) {
            return res.status(401).json({ error: 'Salesforce authentication expired' });
        }
        
        if (error.response?.status === 404) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        
        res.status(500).json({ 
            error: 'Failed to get customer details', 
            details: error.response?.data?.message || error.message 
        });
    }
});

// Cleanup expired tokens (run every hour)
setInterval(() => {
    const now = Date.now();
    const maxAge = 2 * 60 * 60 * 1000; // 2 hours
    
    for (const [key, value] of tokenStore.entries()) {
        if (now - value.timestamp > maxAge) {
            tokenStore.delete(key);
        }
    }
}, 60 * 60 * 1000);

// Start server
app.listen(PORT, () => {
    console.log(`S1M Salesforce Backend running on port ${PORT}`);
    console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
    console.log(`Salesforce URL: ${process.env.SALESFORCE_URL}`);
});

module.exports = app;