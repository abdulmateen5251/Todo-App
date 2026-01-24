# Vercel "Dangerous Site" Error - Fix Guide

## Problem
Your Vercel deployment at `https://todo-app-eight-phi-57.vercel.app` shows a "Dangerous site" warning. This is caused by:

1. **Mixed Content**: HTTP resources loaded on HTTPS site
2. **Missing Security Headers**: No CSP or security configurations
3. **External API Issues**: Hardcoded HTTP URLs or flagged external services
4. **Missing Environment Variables**: Production API URL not configured

## ✅ Fixes Applied

### 1. Security Headers Added
- Updated `frontend/vercel.json` with security headers
- Updated `frontend/next.config.js` with additional headers
- Added Content Security Policy to upgrade insecure requests

### 2. Files Updated
- ✅ `frontend/vercel.json` - Added CSP, X-Frame-Options, etc.
- ✅ `frontend/next.config.js` - Added HSTS and security headers
- ✅ Created `.env.production` template

## 🚀 Deployment Steps

### Step 1: Configure Environment Variables in Vercel

1. **Go to Vercel Dashboard**
   ```
   https://vercel.com/<your-username>/todo-app-eight-phi-57/settings/environment-variables
   ```

2. **Add These Environment Variables** (Production):
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://abdulmateen5251-phase-2.hf.space
   Environment: Production
   ```

   ```
   Name: NEXTAUTH_URL
   Value: https://todo-app-eight-phi-57.vercel.app
   Environment: Production
   ```

   ```
   Name: NEXTAUTH_SECRET
   Value: wtt3EnNWnbNi0uFQtFaZD9gQkBRCWjSw
   Environment: Production
   ```

   ```
   Name: BETTER_AUTH_URL
   Value: https://todo-app-eight-phi-57.vercel.app
   Environment: Production
   ```

   ```
   Name: BETTER_AUTH_SECRET
   Value: wtt3EnNWnbNi0uFQtFaZD9gQkBRCWjSw
   Environment: Production
   ```

### Step 2: Verify Backend API is HTTPS

**⚠️ IMPORTANT**: Your backend MUST use HTTPS!

Current backend: `https://abdulmateen5251-phase-2.hf.space` ✅ (Already HTTPS)

If using a different backend:
- Ensure it's deployed with HTTPS (Hugging Face Spaces, Railway, Render, etc.)
- Update `NEXT_PUBLIC_API_URL` accordingly

### Step 3: Deploy with Git

```bash
# Commit the changes
git add frontend/vercel.json frontend/next.config.js frontend/.env.production
git commit -m "fix: Add security headers to fix Vercel dangerous site warning"
git push origin main
```

Vercel will automatically redeploy with the new configuration.

### Step 4: Force Redeploy (If needed)

If auto-deploy doesn't trigger:

1. Go to **Vercel Dashboard** → **Deployments**
2. Click on the latest deployment
3. Click **"Redeploy"** button
4. Select **"Use existing Build Cache"** = NO
5. Click **"Redeploy"**

### Step 5: Verify the Fix

After deployment:

1. **Wait 2-3 minutes** for DNS/CDN to propagate
2. **Clear browser cache**: `Ctrl+Shift+Del` (or `Cmd+Shift+Del` on Mac)
3. **Visit in incognito/private window**:
   ```
   https://todo-app-eight-phi-57.vercel.app
   ```

4. **Check security headers** using:
   - [Security Headers Check](https://securityheaders.com)
   - Chrome DevTools → Network → Response Headers

## 🔍 Additional Checks

### Check for Mixed Content
```bash
# In frontend directory
grep -r "http://" src/ app/ --include="*.tsx" --include="*.ts"
```

### Verify No Hardcoded Secrets
```bash
# Check for exposed secrets
grep -r "BETTER_AUTH_SECRET\|DATABASE_URL" src/ app/ --include="*.tsx" --include="*.ts"
```

## 🛡️ Security Best Practices

### ✅ DO:
- Always use HTTPS for backend API
- Set environment variables in Vercel Dashboard
- Use `NEXT_PUBLIC_*` prefix ONLY for client-side variables
- Keep secrets in environment variables, never in code

### ❌ DON'T:
- Don't hardcode API URLs with `http://`
- Don't commit `.env.local` or `.env.production` with real secrets
- Don't expose `DATABASE_URL` or secrets to frontend
- Don't mix HTTP and HTTPS resources

## 🔧 Troubleshooting

### Issue: Still showing "Dangerous site"

**Solution 1: Clear Google Safe Browsing Cache**
1. Go to: https://transparencyreport.google.com/safe-browsing/search
2. Search for your URL: `todo-app-eight-phi-57.vercel.app`
3. If flagged incorrectly, request a review

**Solution 2: Check External Dependencies**
```bash
cd frontend
npm audit
npm audit fix
```

**Solution 3: Verify Backend is Accessible**
```bash
curl -I https://abdulmateen5251-phase-2.hf.space/health
# Should return 200 OK with HTTPS
```

**Solution 4: Check Vercel Logs**
1. Vercel Dashboard → Deployments → Click latest
2. Check "Functions" and "Build Logs" for errors
3. Look for mixed content warnings

### Issue: Environment variables not working

**Fix:**
1. Vercel Dashboard → Settings → Environment Variables
2. Make sure variables are set for "Production" environment
3. Redeploy after adding variables

### Issue: CORS errors

Your backend needs these headers:
```python
# In backend/src/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://todo-app-eight-phi-57.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📊 Expected Results

After fixes:
- ✅ No "Dangerous site" warning
- ✅ HTTPS everywhere (lock icon in browser)
- ✅ Security headers present in response
- ✅ No mixed content warnings in console
- ✅ API calls working properly

## 📞 Support

If issues persist:

1. **Check Vercel Build Logs**: Look for build errors
2. **Check Browser Console**: F12 → Console tab for errors
3. **Test Backend Separately**: Ensure Hugging Face Space is running
4. **Request Google Review**: If incorrectly flagged

## 🎯 Next Steps

1. ✅ Set environment variables in Vercel
2. ✅ Push changes to git
3. ✅ Wait for deployment
4. ✅ Test in incognito mode
5. ✅ Verify security headers

---

**Last Updated**: January 24, 2026
**Status**: Ready to deploy
