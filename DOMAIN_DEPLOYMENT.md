# Custom Domain Deployment Guide

## Problem Fixed
Your custom domain was showing README instead of your app because of overly aggressive domain redirection in production.

## Solution Applied
1. **Updated Domain Redirection Logic** - Modified `server/index.ts` to allow custom domains
2. **Whitelisted Allowed Domains** - Only redirects unwanted platform domains, not custom domains

## Setup Steps for Your Custom Domain

### 1. Add Your Domain to Allowed List
In `server/index.ts`, add your custom domain to the `allowedDomains` array:

```javascript
const allowedDomains = [
  'www.savrii.com',
  'savrii.com',
  'localhost:5000',
  'localhost:3000',
  'your-custom-domain.com',        // Add your domain here
  'www.your-custom-domain.com'     // Add www version if used
];
```

### 2. Build and Deploy
```bash
npm run build
npm run start
```

### 3. Environment Variables for Production
Ensure these are set on your hosting platform:
```bash
NODE_ENV=production
DATABASE_URL=your_production_database_url
SESSION_SECRET=your_secure_session_secret
REPLIT_DOMAINS=your-custom-domain.com
```

### 4. DNS Configuration
Point your custom domain to your deployment:
- **A Record**: Point to your server's IP address
- **CNAME**: Point to your hosting platform domain (e.g., yourapp.fly.dev)

### 5. SSL/HTTPS Setup
Ensure your hosting platform has SSL enabled for your custom domain.

## Testing
1. Visit your custom domain
2. Should show your full Savrii app, not README
3. Navigation should work correctly
4. API endpoints should be accessible

## Common Issues
- **Still showing README**: Clear browser cache, check DNS propagation
- **SSL errors**: Ensure SSL certificate is issued for your custom domain
- **API not working**: Check if your hosting platform preserves API routes

## Files Modified
- `server/index.ts` - Fixed domain redirection logic
- Added this deployment guide

Your app is now ready to work with custom domains!
