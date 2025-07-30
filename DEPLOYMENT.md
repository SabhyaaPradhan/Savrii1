# Deployment Guide for Savrii

## Quick Deploy to Replit

[![Deploy on Replit](https://replit.com/badge)](https://replit.com/new/github/your-username/savrii)

## Prerequisites Setup

### 1. Supabase Database Setup
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/projects)
2. Create a new project
3. Click "Connect" button in top toolbar
4. Copy the connection string from "Transaction pooler"
5. Replace `[YOUR-PASSWORD]` with your database password

### 2. OpenAI API Setup
1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new secret key
3. Copy the key (starts with `sk-`)

### 3. Environment Variables
Set these in Replit Secrets or your hosting environment:

```bash
DATABASE_URL=postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
OPENAI_API_KEY=sk-your-openai-api-key-here
SESSION_SECRET=your-secure-random-session-secret
```

## Deployment Steps

### For Replit Hosting

1. **Import Repository**
   - Fork this repository to your GitHub
   - Connect it to Replit
   - Or use the deploy button above

2. **Configure Environment**
   - Add the three environment variables to Replit Secrets
   - They will be available as environment variables

3. **Initialize Database**
   ```bash
   npm run db:push
   ```

4. **Start Application**
   ```bash
   npm run dev
   ```

5. **Deploy**
   - Click "Deploy" in Replit
   - Your app will be available at `https://your-repl-name.your-username.repl.co`

### For Custom Hosting

1. **Clone Repository**
   ```bash
   git clone https://github.com/your-username/savrii.git
   cd savrii
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Create `.env` file with the required variables
   - Or configure them in your hosting platform

4. **Database Migration**
   ```bash
   npm run db:push
   ```

5. **Build Application**
   ```bash
   npm run build
   ```

6. **Start Production Server**
   ```bash
   npm start
   ```

## Post-Deployment Configuration

### 1. Admin Account Setup
After deployment, you can upgrade any account to Enterprise:

```sql
UPDATE users SET plan = 'enterprise', trial_end = NULL WHERE email = 'your-email@example.com';
```

### 2. Domain Configuration
If using a custom domain, update these files:
- Update domain references in SEO meta tags
- Configure CORS settings if needed
- Update authentication callback URLs

### 3. Production Optimizations
- Enable HTTPS (handled automatically by Replit)
- Configure error monitoring
- Set up backup schedules for database
- Monitor API usage and costs

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify DATABASE_URL is correct
   - Check Supabase project status
   - Ensure password is properly encoded

2. **OpenAI API Errors**
   - Verify API key is valid
   - Check OpenAI account has credits
   - Monitor rate limits

3. **Authentication Issues**
   - Check Replit Auth configuration
   - Verify callback URLs match deployment domain
   - Clear browser cache/cookies

### Support Resources
- [Replit Deployments Guide](https://docs.replit.com/deployments)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)

## Monitoring and Maintenance

### Health Checks
The application includes built-in health monitoring:
- Database connection status
- API service availability
- User session management

### Backup Strategy
- Supabase provides automatic backups
- Export user data regularly using built-in export features
- Monitor database usage and scaling needs

### Updates and Maintenance
1. Pull latest changes from repository
2. Run database migrations: `npm run db:push`
3. Restart the application
4. Test core functionality

---

**Need help?** Contact support at hello@savrii.com