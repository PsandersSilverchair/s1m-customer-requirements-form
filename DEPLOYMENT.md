# Deployment Guide for S1M Customer Requirements Form

## Backend Deployment (Railway)

### 1. Sign Up for Railway
- Go to https://railway.app
- Sign up with your GitHub account
- No credit card required for the free tier

### 2. Deploy Backend Service
1. Click "Deploy from GitHub repo"
2. Select your `s1m-customer-requirements-form` repository
3. Railway will detect the Node.js project automatically
4. Click "Deploy"

### 3. Configure Environment Variables
In the Railway dashboard:
1. Go to your project > Variables tab
2. Add these environment variables:
   - `SALESFORCE_CLIENT_ID`: Your Consumer Key from Salesforce Connected App
   - `SALESFORCE_CLIENT_SECRET`: Your Consumer Secret from Salesforce Connected App  
   - `SALESFORCE_URL`: https://scholarone.my.salesforce.com
   - `SALESFORCE_REDIRECT_URI`: https://[your-app-url]/api/auth/callback
   - `FRONTEND_URL`: https://PsandersSilverchair.github.io
   - `NODE_ENV`: production

### 4. Get Your Deployed URL
- Railway will provide a URL like: `https://your-app-name.railway.app`
- Test it by visiting: `https://your-app-name.railway.app/health`

### 5. Update Salesforce Connected App
1. Go to Salesforce Setup > App Manager
2. Find your Connected App and click "Edit"
3. Update Callback URL to: `https://your-app-name.railway.app/api/auth/callback`

### 6. Update Frontend Configuration
Update the backend URL in `salesforce-integration.html`:
```javascript
const DEFAULT_BACKEND_URL = 'https://your-app-name.railway.app';
```

## Alternative: Heroku Deployment

### 1. Install Heroku CLI
```bash
# Install Heroku CLI
brew install heroku/brew/heroku

# Login to Heroku
heroku login
```

### 2. Deploy to Heroku
```bash
cd server
heroku create your-app-name
git push heroku main
```

### 3. Set Environment Variables
```bash
heroku config:set SALESFORCE_CLIENT_ID=your_consumer_key
heroku config:set SALESFORCE_CLIENT_SECRET=your_consumer_secret
heroku config:set SALESFORCE_URL=https://scholarone.my.salesforce.com
heroku config:set SALESFORCE_REDIRECT_URI=https://your-app-name.herokuapp.com/api/auth/callback
heroku config:set FRONTEND_URL=https://PsandersSilverchair.github.io
heroku config:set NODE_ENV=production
```

## Testing Deployment

1. **Health Check**: Visit `https://your-deployed-url/health`
2. **Integration Test**: Use the Salesforce integration page
3. **Customer Search**: Test the complete OAuth flow

## Security Considerations

- Environment variables are encrypted in Railway/Heroku
- HTTPS is enforced in production
- Rate limiting is active
- CORS is configured for your frontend domain

## Troubleshooting

- Check logs in Railway/Heroku dashboard
- Verify environment variables are set correctly
- Ensure Salesforce Connected App callback URL matches exactly
- Test OAuth flow step by step