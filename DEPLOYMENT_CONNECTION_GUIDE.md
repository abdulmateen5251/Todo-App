# 🚀 Complete Deployment & Connection Guide
## Hugging Face Backend + Vercel Frontend

This guide shows you how to connect your **Hugging Face backend** with your **Vercel frontend**.

---

## 📋 Prerequisites Checklist

- ✅ Backend deployed on Hugging Face Spaces: `AbdulMateen5251/hacton`
- ✅ Frontend code ready to deploy
- ✅ GitHub repository with your code
- ✅ Vercel account (free tier works!)

---

## 🎯 Step 1: Verify Hugging Face Backend

### A. Find Your Backend URL

Your Hugging Face Space URL is:
```
https://abdulmateen5251-hacton.hf.space
```

**How to find it:**
1. Go to: https://huggingface.co/spaces/AbdulMateen5251/hacton
2. Click "App" button or wait for it to load
3. Copy the URL from your browser's address bar

### B. Test Your Backend

Run in terminal:
```bash
# Test backend is running
curl https://abdulmateen5251-hacton.hf.space/

# Test API endpoint
curl https://abdulmateen5251-hacton.hf.space/api/tasks

# Check health/docs
curl https://abdulmateen5251-hacton.hf.space/docs
```

Expected response: JSON data or API documentation

---

## 🔧 Step 2: Update Backend CORS (Already Done!)

✅ Your backend CORS is already configured to accept requests from:
- Vercel domains (*.vercel.app)
- Localhost (for development)
- Hugging Face UI

The updated `backend/src/main.py` now includes:
```python
allowed_origins = [
    "http://localhost:3000",
    "https://*.vercel.app",
    "https://huggingface.co",
]
```

**To deploy this change to Hugging Face:**

```bash
# If you haven't set up HF git remote
cd backend
git remote add huggingface https://huggingface.co/spaces/AbdulMatteen5251/hacton
git push huggingface main

# Or upload via web UI
# 1. Go to https://huggingface.co/spaces/AbdulMatteen5251/hacton/tree/main
# 2. Click "Files" → Upload updated main.py
```

---

## 🌐 Step 3: Deploy Frontend to Vercel

### A. Push Code to GitHub

```bash
cd /home/abdul-matten/Desktop/Todo_App/Todo-App

# Add all changes
git add .
git commit -m "Update CORS and environment config for HF deployment"
git push origin main
```

### B. Import Project to Vercel

1. **Go to Vercel:** https://vercel.com/new
2. **Import Git Repository:**
   - Click "Import Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project:**
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)

4. **Set Environment Variables:**

   Click "Environment Variables" and add:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_API_URL` | `https://abdulmateen5251-hacton.hf.space` |

   **Important:** Make sure there's NO trailing slash!

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your app will be live at: `https://your-project.vercel.app`

---

## 🧪 Step 4: Test the Connection

### A. In Browser Console

Visit your Vercel deployment and open browser console (F12):

```javascript
// Test API connection
fetch('https://abdulmateen5251-hacton.hf.space/api/tasks')
  .then(r => r.json())
  .then(data => console.log('✅ Backend connected!', data))
  .catch(err => console.error('❌ Connection failed:', err));

// Check environment variable
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
```

### B. Test Task Creation

1. Open your Vercel app
2. Try creating a task
3. Check browser Network tab (F12 → Network)
4. Look for requests to `abdulmateen5251-hacton.hf.space`

---

## 🔍 Step 5: Monitor & Debug

### Check Hugging Face Logs

```bash
# Set your HF token
export HF_TOKEN='your_token_from_hf_settings'

# View logs
./hf_logs.sh container

# Or use Python script
python3 check_hf_logs.py --container
```

### Check Vercel Logs

1. Go to Vercel Dashboard
2. Select your project
3. Click "Deployments"
4. Click on latest deployment
5. Check "Build Logs" and "Function Logs"

### Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| **CORS errors** | Check HF backend CORS settings, redeploy backend |
| **404 errors** | Verify API URL doesn't have trailing slash |
| **Network timeout** | Check HF Space is running (not sleeping) |
| **401 Unauthorized** | Implement authentication token in requests |
| **Can't fetch data** | Check browser Network tab for exact error |

---

## 📝 Development vs Production URLs

### Development (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Production (Vercel Environment Variables)
```bash
NEXT_PUBLIC_API_URL=https://abdulmateen5251-hacton.hf.space
```

---

## 🎨 Step 6: Custom Domain (Optional)

### Add Custom Domain to Vercel

1. Go to Vercel Dashboard → Your Project
2. Settings → Domains
3. Add your domain: `your-app.com`
4. Follow DNS configuration instructions

### Update Backend CORS

Add your custom domain to backend CORS:

```python
# In backend/src/main.py
allowed_origins = [
    "https://your-app.com",
    "https://*.vercel.app",
    # ... other origins
]
```

---

## 🔐 Security Best Practices

### For Production:

1. **Environment Variables:**
   - Never commit `.env.local` to git
   - Use Vercel's Environment Variables for secrets
   - Separate development and production configs

2. **CORS:**
   - Restrict CORS to specific domains in production
   - Don't use `allow_origins=["*"]` in production

3. **HTTPS Only:**
   - Both Vercel and HF Spaces use HTTPS by default ✅
   - Never use HTTP in production

---

## 🚀 Quick Reference Commands

```bash
# Check HF backend status
curl https://abdulmateen5251-hacton.hf.space/docs

# View HF logs
./hf_logs.sh container

# Redeploy Vercel (automatic on git push)
git push origin main

# Local development
cd frontend
npm run dev  # Frontend on :3000
cd ../backend
uvicorn src.main:app --reload  # Backend on :8000
```

---

## ✅ Final Checklist

- [ ] Backend deployed on Hugging Face
- [ ] Backend CORS updated and redeployed
- [ ] Frontend code pushed to GitHub
- [ ] Project imported to Vercel
- [ ] `NEXT_PUBLIC_API_URL` set in Vercel
- [ ] Frontend deployed successfully
- [ ] API connection tested in browser
- [ ] Tasks can be created/read/updated/deleted
- [ ] No CORS errors in console
- [ ] Both URLs saved for reference:
  - Backend: `https://abdulmateen5251-hacton.hf.space`
  - Frontend: `https://your-project.vercel.app`

---

## 🆘 Need Help?

### Check Logs:
```bash
# Hugging Face logs
./hf_logs.sh

# Vercel logs
# Go to: https://vercel.com/dashboard → Your Project → Deployments
```

### Test Connection:
```bash
# Test backend
curl -v https://abdulmateen5251-hacton.hf.space/api/tasks

# Test with auth (if needed)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://abdulmateen5251-hacton.hf.space/api/tasks
```

---

## 🎉 Success!

Your app is now live:
- **Frontend:** https://your-project.vercel.app
- **Backend API:** https://abdulmateen5251-hacton.hf.space
- **API Docs:** https://abdulmateen5251-hacton.hf.space/docs

Share your app with the world! 🌍
