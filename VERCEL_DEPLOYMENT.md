# 🚀 Vercel Deployment Guide

## 📋 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        VERCEL                               │
│  ┌─────────────────┐        ┌─────────────────┐            │
│  │   Frontend      │        │   Backend API   │            │
│  │   (Next.js)     │───────→│   (Serverless)  │            │
│  │   /frontend     │        │   /backend      │            │
│  └─────────────────┘        └─────────────────┘            │
│           │                          │                      │
└───────────│──────────────────────────│──────────────────────┘
            │                          │
            └──────────┬───────────────┘
                       ▼
         ┌─────────────────────────┐
         │   Neon Postgres         │
         │   (Free Cloud DB)       │
         └─────────────────────────┘
```

---

## 📦 Step 1: Push Code to GitHub

```bash
# Add all files
git add .

# Commit changes
git commit -m "feat: prepare for Vercel deployment"

# Push to GitHub
git push origin main
```

---

## 🗄️ Step 2: Create Free Database (Neon)

1. Go to https://neon.tech
2. Click "Sign Up" → Use GitHub
3. Create new project: `todo-app-db`
4. Copy connection string:
   ```
   postgres://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

---

## 🔧 Step 3: Deploy Backend to Vercel

1. Go to https://vercel.com/new
2. Import GitHub repo: `Todo-App`
3. Configure project:
   - **Project Name:** `todo-app-api`
   - **Root Directory:** `backend`
   - **Framework Preset:** Other
4. Add Environment Variables:
   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | `postgres://...` (from Neon) |
   | `CORS_ORIGINS` | `https://todo-app-frontend.vercel.app` |
5. Click **Deploy**
6. Note your backend URL: `https://todo-app-api.vercel.app`

---

## 🖥️ Step 4: Deploy Frontend to Vercel

1. Go to https://vercel.com/new
2. Import same GitHub repo: `Todo-App`
3. Configure project:
   - **Project Name:** `todo-app-frontend`
   - **Root Directory:** `frontend`
   - **Framework Preset:** Next.js
4. Add Environment Variables:
   | Name | Value |
   |------|-------|
   | `NEXTAUTH_URL` | `https://todo-app-frontend.vercel.app` |
   | `NEXTAUTH_SECRET` | `run: openssl rand -base64 32` |
   | `NEXT_PUBLIC_API_URL` | `https://todo-app-api.vercel.app` |
5. Click **Deploy**

---

## 🔄 Step 5: Update CORS (After Both Deploy)

Go to Backend Project → Settings → Environment Variables:
- Update `CORS_ORIGINS` to your actual frontend URL

---

## ✅ Final Checklist

- [ ] Neon database created
- [ ] Backend deployed to Vercel
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set
- [ ] CORS configured
- [ ] Test sign up / sign in
- [ ] Test create / delete tasks

---

## 🔗 Your URLs

After deployment:
- **Frontend:** `https://todo-app-frontend.vercel.app`
- **Backend API:** `https://todo-app-api.vercel.app`
- **API Docs:** `https://todo-app-api.vercel.app/docs`

---

## 🛠️ Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

---

## ⚠️ Troubleshooting

### Database Connection Error
- Check DATABASE_URL has `?sslmode=require`
- Verify Neon project is active

### CORS Error
- Update CORS_ORIGINS in backend
- Redeploy backend after changes

### Auth Error
- Verify NEXTAUTH_URL matches your domain
- Check NEXTAUTH_SECRET is set

