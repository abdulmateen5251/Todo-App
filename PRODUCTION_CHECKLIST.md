# Production Deployment Checklist

**Project**: Authenticated Todo Application  
**Date**: January 7, 2026  
**Environment**: Production

---

## Pre-Deployment Checklist

### 1. Code Quality
- [X] All tests passing (unit, integration)
- [ ] E2E tests passing (when implemented)
- [ ] Code coverage ≥80% for backend critical paths
- [ ] Code coverage ≥70% for frontend components
- [X] No console.log or debug statements in production code
- [X] TypeScript strict mode enabled
- [ ] Security scan passed (Trivy/Snyk)
- [X] Linting passed (ESLint, Black, Flake8)

### 2. Security
- [X] Environment variables configured (no hardcoded secrets)
- [X] .env files added to .gitignore
- [X] CORS configuration properly restricted
- [X] Security headers enabled (X-Frame-Options, CSP, HSTS)
- [ ] JWT secret key is cryptographically secure (≥32 chars)
- [ ] Rate limiting enabled on API endpoints
- [ ] SQL injection protection (Pydantic/SQLModel ORM)
- [X] XSS protection enabled
- [ ] HTTPS enforced in production
- [ ] Database connection strings use SSL/TLS

### 3. Performance
- [X] Database indexes on frequently queried columns
- [X] Connection pooling configured (NullPool for serverless)
- [ ] CDN configured for static assets
- [ ] Image optimization enabled
- [ ] Compression enabled (gzip/brotli)
- [ ] Response caching where appropriate
- [ ] Database query optimization verified (no N+1)

### 4. Monitoring & Logging
- [X] Request logging enabled in backend
- [X] Performance metrics logged (response time)
- [ ] Error tracking configured (Sentry)
- [ ] Uptime monitoring configured (UptimeRobot/Pingdom)
- [ ] Database monitoring enabled (Neon dashboard)
- [ ] Log aggregation configured (if needed)
- [ ] Alerts configured for critical errors

### 5. Documentation
- [X] README.md complete with setup instructions
- [X] DEPLOYMENT.md with deployment steps
- [X] API documentation accessible (/docs endpoint)
- [ ] Runbook for common issues
- [ ] Architecture diagrams updated
- [ ] Environment variables documented

---

## Backend Deployment (Railway/Render/Fly.io)

### Option A: Railway

#### 1. Pre-Deployment
- [ ] Create Railway account: https://railway.app
- [ ] Install Railway CLI: `npm i -g @railway/cli`
- [ ] Login: `railway login`

#### 2. Deploy Backend
```bash
cd backend
railway init
railway link

# Set environment variables
railway variables set DATABASE_URL="<your-neon-connection-string>"
railway variables set CORS_ORIGINS="https://your-frontend-domain.vercel.app"
railway variables set ENVIRONMENT="production"

# Deploy
railway up
```

#### 3. Post-Deployment
- [ ] Run migrations: `railway run alembic upgrade head`
- [ ] Test health check: `curl https://your-backend.railway.app/health`
- [ ] Test API docs: Visit `https://your-backend.railway.app/docs`
- [ ] Verify logs: `railway logs`

### Option B: Render

#### 1. Pre-Deployment
- [ ] Create Render account: https://render.com
- [ ] Connect GitHub repository

#### 2. Deploy Backend
- [ ] Create new Web Service on Render
- [ ] Select `backend/` as root directory
- [ ] Build command: `pip install -r requirements.txt`
- [ ] Start command: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`

#### 3. Environment Variables
```
DATABASE_URL=<your-neon-connection-string>
CORS_ORIGINS=https://your-frontend-domain.vercel.app
ENVIRONMENT=production
```

#### 4. Post-Deployment
- [ ] Enable health check: Path `/health`, Interval 30s
- [ ] Run migrations via Render shell: `alembic upgrade head`
- [ ] Test endpoints

### Option C: Fly.io

#### 1. Pre-Deployment
- [ ] Install flyctl: https://fly.io/docs/hands-on/install-flyctl/
- [ ] Sign up: `fly auth signup`

#### 2. Deploy Backend
```bash
cd backend

# Initialize Fly app
fly launch --name todo-backend --no-deploy

# Set secrets
fly secrets set DATABASE_URL="<your-neon-connection-string>"
fly secrets set CORS_ORIGINS="https://your-frontend.vercel.app"

# Deploy
fly deploy
```

#### 3. Post-Deployment
- [ ] Run migrations: `fly ssh console -C "alembic upgrade head"`
- [ ] Check status: `fly status`
- [ ] View logs: `fly logs`

---

## Frontend Deployment (Vercel)

### 1. Pre-Deployment
- [ ] Create Vercel account: https://vercel.com
- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Login: `vercel login`

### 2. Deploy Frontend
```bash
cd frontend

# Deploy to production
vercel --prod

# Or link to existing project
vercel link
vercel --prod
```

### 3. Environment Variables (Vercel Dashboard)
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

### 4. Post-Deployment
- [ ] Test frontend: Visit your Vercel URL
- [ ] Verify API connection
- [ ] Test all user flows
- [ ] Check browser console for errors
- [ ] Test on mobile devices

---

## Database Setup (Neon)

### 1. Create Production Database
- [ ] Create Neon account: https://neon.tech
- [ ] Create new project: `todo-app-production`
- [ ] Create database: `todo_prod`
- [ ] Copy connection string

### 2. Configure Database
- [ ] Enable connection pooling if needed
- [ ] Set autoscaling limits (compute units)
- [ ] Configure backup retention (default: 7 days)
- [ ] Enable branch protection

### 3. Run Migrations
```bash
# From local machine
cd backend
export DATABASE_URL="<neon-connection-string>"
alembic upgrade head
```

### 4. Verify Database
- [ ] Check tables exist in Neon dashboard
- [ ] Verify indexes created
- [ ] Test connection from backend

---

## Post-Deployment Verification

### 1. Health Checks
- [ ] Backend health endpoint: `GET /health` → 200 OK
- [ ] Frontend loads successfully
- [ ] API documentation accessible: `/docs`
- [ ] Database connection successful

### 2. Functional Testing
- [ ] User can create account (when auth implemented)
- [ ] User can create task
- [ ] User can list tasks
- [ ] User can edit task
- [ ] User can complete task
- [ ] User can delete task
- [ ] User can undo delete (5-second window)
- [ ] Filters work (all/active/completed)
- [ ] Mobile responsive layout works

### 3. Security Testing
- [ ] HTTPS enforced (no HTTP fallback)
- [ ] Security headers present (check with SecurityHeaders.com)
- [ ] CORS blocks unauthorized origins
- [ ] API rejects invalid tokens (when auth implemented)
- [ ] Cross-user isolation works (User A cannot see User B's tasks)

### 4. Performance Testing
- [ ] Initial page load <2s (3G network)
- [ ] API response time <200ms (p95)
- [ ] Database queries <100ms
- [ ] No memory leaks (check backend metrics)

### 5. Monitoring Verification
- [ ] Logs appearing in monitoring service
- [ ] Error tracking capturing exceptions
- [ ] Uptime monitor pinging health endpoint
- [ ] Alerts configured and tested

---

## Rollback Plan

### Backend Rollback (Railway)
```bash
# Rollback to previous deployment
railway rollback

# Or deploy specific version
git checkout <previous-commit>
railway up
```

### Backend Rollback (Render)
- Go to Render dashboard
- Select service
- Click "Manual Deploy" → Select previous deployment

### Backend Rollback (Fly.io)
```bash
# List releases
fly releases

# Rollback to specific version
fly releases rollback v2
```

### Frontend Rollback (Vercel)
- Go to Vercel dashboard
- Select deployment
- Click "Promote to Production" on previous deployment

### Database Rollback
```bash
# Rollback one migration
alembic downgrade -1

# Rollback to specific version
alembic downgrade <revision>
```

**⚠️ WARNING**: Database rollbacks can cause data loss. Always backup first!

---

## Environment Variables Reference

### Backend (.env)
```bash
# Required
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
CORS_ORIGINS=https://your-frontend.vercel.app
ENVIRONMENT=production

# Optional
LOG_LEVEL=INFO
SENTRY_DSN=https://your-sentry-dsn
JWT_SECRET_KEY=<your-secret-key-min-32-chars>
```

### Frontend (.env.local)
```bash
# Required
NEXT_PUBLIC_API_URL=https://your-backend.railway.app

# Optional
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn
NEXT_PUBLIC_ENVIRONMENT=production
```

---

## Success Criteria

Deployment is successful when:
- ✅ All health checks passing
- ✅ All user stories functional end-to-end
- ✅ No console errors in browser
- ✅ API documentation accessible
- ✅ HTTPS enforced
- ✅ Security headers present
- ✅ Monitoring/alerting active
- ✅ Rollback plan tested

---

## Support & Troubleshooting

### Common Issues

#### 1. Database Connection Failed
- Check DATABASE_URL format includes `?sslmode=require`
- Verify Neon IP whitelist (should be 0.0.0.0/0 for serverless)
- Check NullPool is configured for serverless

#### 2. CORS Errors
- Verify CORS_ORIGINS matches frontend domain exactly
- Check protocol (https vs http)
- Ensure no trailing slashes

#### 3. 500 Internal Server Error
- Check backend logs: `railway logs` or Render dashboard
- Verify all environment variables set
- Check database migrations ran successfully

#### 4. Frontend Not Loading
- Verify NEXT_PUBLIC_API_URL is set correctly
- Check Vercel build logs for errors
- Clear browser cache and retry

### Emergency Contacts
- **Platform Support**: Railway/Render/Vercel support chat
- **Database**: Neon support (support@neon.tech)
- **Team Lead**: [Your contact info]

---

**Last Updated**: January 7, 2026  
**Version**: 1.0.0
