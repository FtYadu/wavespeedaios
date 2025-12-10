# Deployment Guide

This guide provides step-by-step instructions for deploying the AI Chat Interface application to production.

## Architecture Overview

- **Frontend**: Next.js application deployed to Vercel
- **Backend**: NestJS API deployed to Railway (or alternative cloud platform)
- **Database**: PostgreSQL database (Supabase, Neon, or Railway)

## Prerequisites

1. **Required Accounts**:
   - [Vercel](https://vercel.com) account
   - [Railway](https://railway.app) account (or AWS/Heroku alternative)
   - [Supabase](https://supabase.com) account (or other PostgreSQL provider)
   - [WaveSpeed AI](https://wavespeed.ai) API account

2. **Environment Variables**:
   - WaveSpeed AI API Key
   - JWT Secret
   - Database connection string

## Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the application:
   ```bash
   npm run build
   ```

### Step 2: Configure Environment Variables

Create a `.env.local` file in the frontend directory:

```env
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-key
BACKEND_URL=https://your-backend-domain.up.railway.app
```

### Step 3: Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

3. Set environment variables in Vercel dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add all required variables

### Alternative: GitHub Integration

1. Push frontend code to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy automatically on push

## Backend Deployment (Railway)

### Step 1: Prepare Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the application:
   ```bash
   npm run build
   ```

### Step 2: Database Setup

#### Option A: Supabase

1. Create a new project on Supabase
2. Copy the database connection string
3. Run Prisma migrations:
   ```bash
   npx prisma migrate deploy
   ```

#### Option B: Railway Database

1. Create a new PostgreSQL database service
2. Copy the connection string
3. Run migrations

### Step 3: Configure Environment Variables

Create environment variables in Railway dashboard:

```env
# Application
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://username:password@host:port/database

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRATION=7d

# WaveSpeed AI
WAVESPEED_API_KEY=your-wavespeed-api-key
WAVESPEED_API_URL=https://api.wavespeed.ai/v1

# CORS
FRONTEND_URL=https://your-domain.vercel.app

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX_REQUESTS=10

# Security
BCRYPT_ROUNDS=10
```

### Step 4: Deploy to Railway

#### Option A: Railway CLI

1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Login and link project:
   ```bash
   railway login
   railway link
   ```

3. Deploy:
   ```bash
   railway up
   ```

#### Option B: GitHub Integration

1. Push backend code to GitHub
2. Connect repository to Railway
3. Configure environment variables
4. Deploy automatically on push

## Alternative Backend Deployment Options

### Heroku Deployment

1. Create Heroku app:
   ```bash
   heroku create your-app-name
   ```

2. Add PostgreSQL addon:
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

3. Set environment variables:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret
   # ... set all other variables
   ```

4. Deploy:
   ```bash
   git push heroku main
   ```

### AWS Deployment (Elastic Beanstalk)

1. Install EB CLI:
   ```bash
   pip install awsebcli
   ```

2. Initialize EB:
   ```bash
   eb init your-app-name
   ```

3. Create environment:
   ```bash
   eb create production
   ```

4. Configure environment variables in AWS Console

## Security Configuration

### HTTPS Enforcement

1. **Vercel**: Automatically enabled
2. **Railway**: Automatically enabled
3. **Custom Domains**: Configure SSL certificates

### Environment Variables Security

1. Never commit `.env` files
2. Use strong secrets (generate with `openssl rand -hex 32`)
3. Rotate secrets regularly
4. Use different secrets for different environments

### Database Security

1. Use connection pooling
2. Enable SSL connections
3. Restrict IP access if possible
4. Regular backups

## Monitoring and Logging

### Application Monitoring

1. **Frontend**: Vercel Analytics
2. **Backend**: Railway provides basic monitoring
3. **Database**: Monitor connection limits and performance

### Error Tracking

Consider integrating:
- Sentry for error tracking
- LogRocket for frontend monitoring
- Winston for backend logging

## Performance Optimization

### Frontend

1. Enable Next.js optimizations:
   ```js
   // next.config.js
   module.exports = {
     swcMinify: true,
     compress: true,
   };
   ```

2. Optimize images with Next.js Image component
3. Implement proper caching headers

### Backend

1. Enable compression
2. Implement response caching
3. Use connection pooling for database
4. Monitor API response times

### Database

1. Add indexes for frequently queried columns
2. Use connection pooling
3. Monitor query performance
4. Implement read replicas if needed

## Backup and Recovery

### Database Backups

1. **Supabase**: Automated daily backups
2. **Railway**: Manual backup options
3. **Custom**: Set up automated backup scripts

### Application Backups

1. Version control (Git)
2. Regular codebase backups
3. Environment variable documentation

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check `FRONTEND_URL` configuration
2. **Database Connection**: Verify connection string
3. **API Key Issues**: Ensure WaveSpeed API key is valid
4. **Build Failures**: Check Node.js version compatibility

### Debug Commands

```bash
# Frontend
npm run dev  # Development
npm run build  # Production build

# Backend
npm run start:dev  # Development
npm run build  # Production build
npm run start:prod  # Production
```

## Maintenance

### Regular Tasks

1. Update dependencies monthly
2. Monitor error logs
3. Review performance metrics
4. Backup database weekly
5. Rotate API keys quarterly

### Updates

1. Test updates in staging environment
2. Update one dependency at a time
3. Monitor for breaking changes
4. Keep documentation updated

## Support

For deployment issues:
1. Check application logs
2. Review environment configuration
3. Test locally with production variables
4. Contact platform support if needed

## Cost Optimization

### Frontend (Vercel)
- Monitor bandwidth usage
- Optimize images and assets
- Use proper caching strategies

### Backend (Railway)
- Monitor resource usage
- Scale services appropriately
- Use free tier for development

### Database
- Monitor connection usage
- Optimize queries
- Clean old data regularly