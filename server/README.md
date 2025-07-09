# S1M Salesforce Backend Service

A Node.js backend service that handles Salesforce OAuth authentication and API calls for the S1M Customer Requirements Form.

## Features

- **Secure OAuth Flow**: PKCE-enabled OAuth 2.0 flow with Salesforce
- **Real-time Customer Search**: Search Salesforce Accounts with SOSL queries
- **Customer Details**: Get detailed information about specific customers
- **Session Management**: Secure session handling with automatic cleanup
- **Rate Limiting**: API rate limiting for security
- **Error Handling**: Comprehensive error handling and logging

## Setup

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env` file with your Salesforce credentials:
```env
SALESFORCE_CLIENT_ID=your_consumer_key_from_connected_app
SALESFORCE_CLIENT_SECRET=your_consumer_secret_from_connected_app
SALESFORCE_URL=https://yourcompany.my.salesforce.com
SALESFORCE_REDIRECT_URI=http://localhost:3000/api/auth/callback
FRONTEND_URL=https://PsandersSilverchair.github.io
```

### 3. Update Salesforce Connected App
Update your Connected App callback URL to:
```
http://localhost:3000/api/auth/callback
```

### 4. Run the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

Server will run on http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/start` - Start OAuth flow
- `GET /api/auth/callback` - Handle OAuth callback

### Customers
- `GET /api/customers/search?q=search_term&session=token` - Search customers
- `GET /api/customers/:id?session=token` - Get customer details

### Utilities
- `GET /health` - Health check

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing protection
- **Rate Limiting**: Prevents abuse
- **PKCE**: Proof Key for Code Exchange for OAuth security
- **Session Management**: Secure token storage with automatic cleanup

## Deployment Options

### Option 1: Heroku
1. Create Heroku app
2. Set environment variables
3. Deploy with Git

### Option 2: Railway
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### Option 3: AWS/Azure
1. Use container service (ECS, Container Apps)
2. Configure environment variables
3. Set up load balancing

## Production Considerations

- **Database**: Replace in-memory token store with Redis/database
- **Logging**: Add structured logging (Winston, Pino)
- **Monitoring**: Add health checks and metrics
- **SSL**: Ensure HTTPS for production
- **Scaling**: Consider multiple instances with shared storage

## Testing

Test endpoints with curl:

```bash
# Health check
curl http://localhost:3000/health

# Start auth flow
curl -X POST http://localhost:3000/api/auth/start \
  -H "Content-Type: application/json" \
  -d '{"salesforceUrl": "https://yourcompany.my.salesforce.com"}'
```