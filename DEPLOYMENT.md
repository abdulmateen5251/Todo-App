# Deployment Guide

## Overview

This guide covers deploying the authenticated Todo application with a FastAPI backend and Next.js frontend.

## Architecture

- **Backend**: FastAPI (Python 3.11+) with SQLModel/PostgreSQL
- **Frontend**: Next.js 14+ with TypeScript and Tailwind CSS
- **Database**: Neon Serverless PostgreSQL
- **Authentication**: Better Auth (JWT tokens)

---

## Prerequisites

### Required Accounts
1. **Neon Database** - https://neon.tech (free tier available)
2. **Vercel** (Frontend) - https://vercel.com (recommended for Next.js)
3. **Railway/Render/Fly.io** (Backend) - Choose one cloud provider

### Required Software
- Node.js 20+ and npm
- Python 3.11+
- Git

---

## Environment Variables

### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# Authentication (Better Auth)
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=https://your-backend-domain.com

# CORS
FRONTEND_URL=https://your-frontend-domain.vercel.app

# Environment
ENVIRONMENT=production
```

### Frontend (.env.local)

```bash
# API
NEXT_PUBLIC_API_URL=https://your-backend-domain.com

# Authentication (Better Auth)
NEXT_PUBLIC_AUTH_URL=https://your-backend-domain.com/api/auth
```

---

## Database Setup (Neon)

### 1. Create Neon Project

```bash
# Visit https://neon.tech
# Click "Create Project"
# Name: todo-app-production
# Region: Choose closest to your users
# Copy connection string
```

### 2. Run Migrations

```bash
cd backend
pip install -r requirements.txt
export DATABASE_URL="your-neon-connection-string"
alembic upgrade head
```

### 3. Verify Connection

```bash
python -c "from src.db.session import init_db; init_db(); print('✓ Database connected')"
```

---

## Backend Deployment

### Option 1: Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Create new project
railway init

# Add environment variables
railway variables set DATABASE_URL="your-neon-url"
railway variables set BETTER_AUTH_SECRET="your-secret"
railway variables set FRONTEND_URL="https://your-app.vercel.app"

# Deploy
railway up
```

### Option 2: Render

```bash
# Create render.yaml in project root
```

```yaml
services:
  - type: web
    name: todo-api
    env: python
    buildCommand: "pip install -r backend/requirements.txt"
    startCommand: "cd backend && uvicorn src.main:app --host 0.0.0.0 --port $PORT"
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: BETTER_AUTH_SECRET
        generateValue: true
      - key: FRONTEND_URL
        value: https://your-app.vercel.app
```

```bash
# Push to GitHub
# Connect repository in Render dashboard
# Deploy automatically
```

### Option 3: Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch app
cd backend
fly launch --name todo-api

# Set secrets
fly secrets set DATABASE_URL="your-neon-url"
fly secrets set BETTER_AUTH_SECRET="your-secret"
fly secrets set FRONTEND_URL="https://your-app.vercel.app"

# Deploy
fly deploy
```

---

## Frontend Deployment (Vercel)

### 1. Connect Repository

```bash
# Visit https://vercel.com
# Click "New Project"
# Import your Git repository
# Select "frontend" as root directory
```

### 2. Configure Build Settings

```
Framework Preset: Next.js
Root Directory: frontend
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### 3. Environment Variables

Add in Vercel dashboard:
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_AUTH_URL=https://your-backend.railway.app/api/auth
```

### 4. Deploy

```bash
# Auto-deploys on git push to main
# Or manual deployment:
cd frontend
npx vercel --prod
```

---

## Post-Deployment Checklist

### Backend Health Check

```bash
curl https://your-backend.railway.app/health
# Expected: {"status": "healthy", "environment": "production"}
```

### API Documentation

Visit: `https://your-backend.railway.app/docs`

### Test Endpoints

```bash
# Create a test task (requires authentication)
curl -X POST https://your-backend.railway.app/api/{user_id}/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"description": "Test task", "due_date": null}'
```

### Frontend Health Check

Visit: `https://your-app.vercel.app`

### Security Verification

```bash
# Check security headers
curl -I https://your-backend.railway.app/health
# Should include:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
```

---

## CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      - name: Run tests
        run: |
          cd backend
          pytest tests/ -v

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      - name: Run tests
        run: |
          cd frontend
          npm test
      - name: Build
        run: |
          cd frontend
          npm run build
```

---

## Monitoring & Logging

### Sentry Setup (Error Tracking)

```bash
# Install Sentry SDK
cd backend
pip install sentry-sdk[fastapi]

cd frontend
npm install @sentry/nextjs
```

Backend integration (`backend/src/main.py`):
```python
import sentry_sdk

sentry_sdk.init(
    dsn="your-sentry-dsn",
    environment="production",
    traces_sample_rate=0.1,
)
```

Frontend integration (`frontend/sentry.client.config.js`):
```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### Log Aggregation

**Railway**: Logs available in dashboard
**Render**: Integrated logging in dashboard  
**Vercel**: Function logs in deployment details

---

## Performance Optimization

### Database
- ✅ Indexes on `user_id` and `completed` columns
- ✅ NullPool for Neon serverless compatibility
- Connection pooling managed by Neon

### Backend
- ✅ Pydantic validation caching
- ✅ Response compression (enable in production)
- Consider Redis caching for frequent queries

### Frontend
- ✅ Next.js automatic code splitting
- ✅ Image optimization
- ✅ Server-side rendering for initial load
- Enable CDN caching on Vercel

---

## Security Hardening

### Backend
- ✅ Security headers (X-Frame-Options, CSP, etc.)
- ✅ CORS restricted to frontend domain
- ✅ Request validation (Pydantic)
- ✅ SQL injection prevention (SQLModel ORM)
- ⚠️ Rate limiting (TODO: implement in production)
- ⚠️ API authentication (Better Auth integration pending)

### Frontend
- ✅ Environment variables for secrets
- ✅ HTTPOnly cookies (when auth implemented)
- ✅ CSP headers via Vercel config

### Database
- ✅ SSL mode required
- ✅ Strong password requirements
- Connection string in environment variables only

---

## Rollback Procedure

### Backend Rollback

```bash
# Railway
railway rollback

# Render
# Use dashboard to select previous deployment

# Fly.io
fly releases
fly releases rollback <version>
```

### Frontend Rollback

```bash
# Vercel
vercel rollback <deployment-url>
```

### Database Rollback

```bash
cd backend
alembic downgrade -1  # Rollback one migration
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
psql "your-neon-connection-string"

# Check Neon dashboard for:
# - Compute status (should be Active)
# - Connection pooling settings
# - IP allowlist (if configured)
```

### CORS Errors

Verify in `backend/src/main.py`:
```python
origins = [
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
]
```

Update `FRONTEND_URL` environment variable to match your Vercel domain.

### 500 Errors

Check backend logs:
```bash
# Railway
railway logs

# Render
# View logs in dashboard

# Fly.io
fly logs
```

### Build Failures

**Backend**:
- Verify Python version (3.11+)
- Check requirements.txt for conflicts

**Frontend**:
- Clear build cache
- Verify Node version (20+)
- Check for TypeScript errors

---

## Scaling Considerations

### Database (Neon)
- Free tier: 0.5 GB storage, 3 GB transfer
- Upgrade to Pro for autoscaling compute

### Backend
- Horizontal scaling via platform (Railway/Render auto-scale)
- Add Redis for session storage at scale

### Frontend
- Vercel handles automatic scaling
- CDN edge caching worldwide

---

## Support & Maintenance

### Regular Tasks
- [ ] Monitor error rates (Sentry)
- [ ] Review logs weekly
- [ ] Update dependencies monthly
- [ ] Database backups (Neon auto-backups)
- [ ] Performance monitoring (p95 latency)

### Emergency Contacts
- Neon Support: support@neon.tech
- Vercel Support: support@vercel.com
- Railway Support: https://railway.app/help

---

## Next Steps

1. ✅ Set up production environment variables
2. ✅ Deploy backend to cloud provider
3. ✅ Deploy frontend to Vercel
4. ✅ Configure custom domains (optional)
5. ⚠️ Implement Better Auth authentication
6. ⚠️ Set up monitoring (Sentry)
7. ⚠️ Configure CI/CD pipeline
8. ⚠️ Load testing and optimization

---

## Additional Resources

- [Neon Documentation](https://neon.tech/docs)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app/)
